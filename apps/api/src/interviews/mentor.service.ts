import { Injectable, NotFoundException, BadRequestException, Logger, ForbiddenException } from '@nestjs/common';
import { prisma, InterviewType, InterviewStatus, MentorVerificationStatus, MentorProfile } from '@skillforge/db';
import Stripe from 'stripe';

@Injectable()
export class MentorService {
  private readonly logger = new Logger(MentorService.name);
  private stripe!: Stripe;

  constructor() {
    const apiKey = process.env.STRIPE_SECRET_KEY ?? '';
    // Initialize Stripe only if API key is provided
    if (apiKey) {
      this.stripe = new Stripe(apiKey, {
        apiVersion: '2025-01-27.acacia' as any,
      });
    }
  }

  /**
   * List all verified mentors
   */
  async listMentors() {
    const profiles = await prisma.mentorProfile.findMany({
      where: {
        verificationStatus: MentorVerificationStatus.approved,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        availabilities: {
          where: {
            isActive: true,
          },
        },
      },
    });

    return profiles;
  }

  /**
   * Book a session with a mentor (and trigger Stripe payment or bypass if allowed)
   */
  async bookSession(
    studentId: string,
    mentorId: string,
    scheduledAt: Date,
    interviewType: InterviewType,
    targetCompany?: string,
    bypassPayment = false,
  ) {
    const mentorProfile = await prisma.mentorProfile.findUnique({
      where: { userId: mentorId },
      include: { user: true },
    });

    if (!mentorProfile || mentorProfile.verificationStatus !== MentorVerificationStatus.approved) {
      throw new NotFoundException('Mentor not found or not approved');
    }

    // 1. Create the base session record
    const session = await prisma.interviewSession.create({
      data: {
        studentId,
        mentorId,
        type: 'human',
        interviewType,
        targetCompany: targetCompany ?? null,
        status: InterviewStatus.scheduled,
        scheduledAt: new Date(scheduledAt),
      },
    });

    // 2. Stripe test-mode fallback guardrail
    const isProduction = process.env.NODE_ENV === 'production';

    if (bypassPayment) {
      if (isProduction) {
        // HARD GUARDAIL: Never allow bypass in production
        throw new ForbiddenException('Bypass payment is not allowed in production');
      }

      this.logger.log(`[TEST BYPASS] Marking session ${session.id} as paid (bypassPayment=true)`);
      // Update session pricePaid and verify immediately
      const pricePaid = mentorProfile.sessionPrice;
      await prisma.interviewSession.update({
        where: { id: session.id },
        data: {
          pricePaid,
        },
      });

      // Split fee: 85% to mentor's totalEarned
      const payout = Number(pricePaid) * 0.85;
      await prisma.mentorProfile.update({
        where: { id: mentorProfile.id },
        data: {
          totalEarned: {
            increment: payout,
          },
        },
      });

      return {
        success: true,
        sessionId: session.id,
        bypass: true,
      };
    }

    // Standard Stripe Integration
    if (!this.stripe) {
      if (isProduction) {
        throw new BadRequestException('Stripe is not configured on this server');
      } else {
        // Fallback for local testing without keys (throw readable error or return mocked URL)
        throw new BadRequestException('STRIPE_SECRET_KEY is missing. Use bypassPayment=true for local testing');
      }
    }

    try {
      const priceInCents = Math.round(Number(mentorProfile.sessionPrice) * 100);
      const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';

      const checkoutSession = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `1-on-1 ${interviewType.toUpperCase()} Interview with Mentor ${mentorProfile.user.name}`,
                description: `Scheduled for ${new Date(scheduledAt).toLocaleString()}`,
              },
              unit_amount: priceInCents,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${frontendUrl}/interviews?payment=success&session_id=${session.id}`,
        cancel_url: `${frontendUrl}/interviews?payment=cancel`,
        metadata: {
          sessionId: session.id,
          mentorProfileId: mentorProfile.id,
        },
      });

      return {
        success: true,
        sessionId: session.id,
        checkoutUrl: checkoutSession.url,
      };
    } catch (err: any) {
      this.logger.error('Failed to create Stripe Checkout session:', err);
      throw new BadRequestException(`Stripe error: ${err.message}`);
    }
  }

  /**
   * Handle Webhook updates from Stripe
   */
  async handleStripeWebhook(payload: Buffer, signature: string, secret: string) {
    if (!this.stripe) {
      throw new BadRequestException('Stripe not initialized');
    }

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(payload, signature, secret);
    } catch (err: any) {
      this.logger.error('Webhook signature verification failed:', err.message);
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const stripeSession = event.data.object as Stripe.Checkout.Session;
      const sessionId = stripeSession.metadata?.sessionId;
      const mentorProfileId = stripeSession.metadata?.mentorProfileId;

      if (sessionId && mentorProfileId) {
        const totalPaid = (stripeSession.amount_total ?? 0) / 100;
        this.logger.log(`Payment confirmed for Session ${sessionId}. Amount: $${totalPaid}`);

        // Update session
        await prisma.interviewSession.update({
          where: { id: sessionId },
          data: {
            pricePaid: totalPaid,
          },
        });

        // 15% Platform Commission: 85% goes to the mentor
        const mentorPayout = totalPaid * 0.85;

        await prisma.mentorProfile.update({
          where: { id: mentorProfileId },
          data: {
            totalEarned: {
              increment: mentorPayout,
            },
          },
        });
      }
    }

    return { success: true };
  }

  /**
   * Update Mentor Profile
   */
  async updateProfile(userId: string, data: Partial<MentorProfile>) {
    const existing = await prisma.mentorProfile.findUnique({
      where: { userId },
    });

    if (!existing) {
      // Create if it doesn't exist
      return prisma.mentorProfile.create({
        data: {
          userId,
          bio: data.bio ?? 'Professional Mentor',
          headline: data.headline ?? 'Technical Expert',
          expertise: data.expertise ?? [],
          experienceYears: data.experienceYears ?? 3,
          sessionPrice: data.sessionPrice ?? 50.00,
          verificationStatus: MentorVerificationStatus.approved, // Auto approve in dev
        },
      });
    }

    return prisma.mentorProfile.update({
      where: { userId },
      data: {
        bio: data.bio,
        headline: data.headline,
        expertise: data.expertise,
        experienceYears: data.experienceYears,
        sessionPrice: data.sessionPrice,
        sessionDurationMinutes: data.sessionDurationMinutes,
      },
    });
  }

  /**
   * Submit review for mentor & recalculate averages
   */
  async submitReview(studentId: string, sessionId: string, rating: number, comment?: string) {
    const session = await prisma.interviewSession.findUnique({
      where: { id: sessionId },
    });

    if (!session || !session.mentorId || session.studentId !== studentId) {
      throw new NotFoundException('Session not found');
    }

    if (session.status !== InterviewStatus.completed) {
      throw new BadRequestException('Can only review completed interview sessions');
    }

    // Submit review
    const review = await prisma.mentorReview.create({
      data: {
        sessionId,
        studentId,
        mentorId: session.mentorId,
        rating,
        comment,
      },
    });

    // Recalculate average ratings
    const reviews = await prisma.mentorReview.findMany({
      where: { mentorId: session.mentorId },
    });

    const average = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    // Recalculate rebooking rate
    // Rebooking rate = (total completed sessions by students with >1 completed session with this mentor) / total completed sessions
    const sessions = await prisma.interviewSession.findMany({
      where: { mentorId: session.mentorId, status: InterviewStatus.completed },
    });

    const studentBookingsCountMap = new Map<string, number>();
    for (const s of sessions) {
      studentBookingsCountMap.set(s.studentId, (studentBookingsCountMap.get(s.studentId) ?? 0) + 1);
    }

    let rebookingStudentsCount = 0;
    studentBookingsCountMap.forEach((count) => {
      if (count > 1) {
        rebookingStudentsCount++;
      }
    });

    const uniqueStudents = studentBookingsCountMap.size;
    const rebookingRate = uniqueStudents > 0 ? rebookingStudentsCount / uniqueStudents : 0.0;

    await prisma.mentorProfile.update({
      where: { userId: session.mentorId },
      data: {
        ratingAverage: average,
        ratingCount: reviews.length,
        rebookingRate,
      },
    });

    return review;
  }
}
