import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export interface TestResult {
  passed: boolean;
  input: string;
  expected: string;
  actual: string;
  error?: string;
}

export interface RunCodeResult {
  success: boolean;
  compileError?: string;
  testResults: TestResult[];
}

@Injectable()
export class CodeRunnerService implements OnModuleInit {
  private readonly logger = new Logger(CodeRunnerService.name);

  onModuleInit() {
    // Reload Windows PATH if running on Windows to ensure compilers like gcc/g++ are found
    if (process.platform === 'win32') {
      try {
        const machinePath = execSync('powershell -Command "[System.Environment]::GetEnvironmentVariable(\'Path\',\'Machine\')"').toString().trim();
        const userPath = execSync('powershell -Command "[System.Environment]::GetEnvironmentVariable(\'Path\',\'User\')"').toString().trim();
        process.env.PATH = `${machinePath};${userPath}`;
        this.logger.log('Windows PATH environment variable reloaded successfully.');
      } catch (err) {
        this.logger.error('Failed to reload Windows PATH environment variable:', err);
      }
    }
  }

  async runCode(
    language: string,
    code: string,
    functionName: string,
    testCases: Array<{ input: string; output: string }>,
    validationRegex?: string,
  ): Promise<RunCodeResult> {
    // 1. Optional Regex Check
    if (validationRegex) {
      try {
        const regex = new RegExp(validationRegex);
        if (!regex.test(code)) {
          return {
            success: false,
            compileError: `Code structure validation failed. Your code must contain required syntax/keywords matching: ${validationRegex}`,
            testResults: [],
          };
        }
      } catch (e: any) {
        this.logger.error(`Invalid validation regex: ${validationRegex}`, e);
      }
    }

    // 2. Prepare Temp Directory
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'skillforge-run-'));

    try {
      const lang = language.toUpperCase();
      let compileCmd = '';
      let runCmdPattern = '';
      let fileExt = '';

      if (lang === 'C') {
        fileExt = '.c';
        const wrapper = `
#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>
#include <string.h>
#include <math.h>

${code}

int main(int argc, char *argv[]) {
    if (argc < 2) return 1;
    int input = atoi(argv[1]);
    printf("%d\\n", ${functionName}(input));
    return 0;
}
`;
        fs.writeFileSync(path.join(tempDir, `solution${fileExt}`), wrapper);
        compileCmd = `gcc solution.c -o solution.exe`;
        runCmdPattern = `solution.exe "{INPUT}"`;
      } else if (lang === 'CPP') {
        fileExt = '.cpp';
        const wrapper = `
#include <iostream>
#include <string>
#include <vector>
#include <cmath>
#include <algorithm>

${code}

int main(int argc, char *argv[]) {
    if (argc < 2) return 1;
    int input = std::stoi(argv[1]);
    std::cout << ${functionName}(input) << std::endl;
    return 0;
}
`;
        fs.writeFileSync(path.join(tempDir, `solution${fileExt}`), wrapper);
        compileCmd = `g++ solution.cpp -o solution.exe`;
        runCmdPattern = `solution.exe "{INPUT}"`;
      } else if (lang === 'JAVA') {
        // Java needs class Solution and class Runner
        fs.writeFileSync(path.join(tempDir, 'Solution.java'), code);
        const runnerCode = `
public class Runner {
    public static void main(String[] args) {
        if (args.length < 1) return;
        int input = Integer.parseInt(args[0]);
        System.out.println(Solution.${functionName}(input));
    }
}
`;
        fs.writeFileSync(path.join(tempDir, 'Runner.java'), runnerCode);
        compileCmd = 'javac Solution.java Runner.java';
        runCmdPattern = 'java Runner "{INPUT}"';
      } else if (lang === 'PYTHON') {
        fileExt = '.py';
        const wrapper = `
import sys

${code}

if __name__ == '__main__':
    if len(sys.argv) > 1:
        val = int(sys.argv[1])
        print(${functionName}(val))
`;
        fs.writeFileSync(path.join(tempDir, `solution${fileExt}`), wrapper);
        runCmdPattern = 'python solution.py "{INPUT}"';
      } else if (lang === 'JAVASCRIPT') {
        fileExt = '.js';
        const wrapper = `
${code}

const input = parseInt(process.argv[2], 10);
console.log(${functionName}(input));
`;
        fs.writeFileSync(path.join(tempDir, `solution${fileExt}`), wrapper);
        runCmdPattern = 'node solution.js "{INPUT}"';
      } else {
        return {
          success: false,
          compileError: `Unsupported language track: ${language}`,
          testResults: [],
        };
      }

      // Compile if needed
      if (compileCmd) {
        try {
          execSync(compileCmd, { cwd: tempDir, stdio: 'pipe', timeout: 5000 });
        } catch (error: any) {
          const stderr = error.stderr?.toString() || '';
          const stdout = error.stdout?.toString() || '';
          return {
            success: false,
            compileError: stderr || stdout || error.message || 'Compilation failed',
            testResults: [],
          };
        }
      }

      // Run test cases
      const testResults: TestResult[] = [];
      let allPassed = true;

      for (const tc of testCases) {
        const inputStr = tc.input;
        const expectedStr = tc.output.replace(/\r\n/g, '\n').trim();
        const cmd = runCmdPattern.replace('{INPUT}', inputStr);

        let actualStr = '';
        let passed = false;
        let errorMsg = '';
        const timeoutLimit = lang === 'JAVA' ? 3000 : 2000;

        try {
          const stdout = execSync(cmd, {
            cwd: tempDir,
            stdio: 'pipe',
            timeout: timeoutLimit,
          });
          actualStr = stdout.toString().replace(/\r\n/g, '\n').trim();
          passed = actualStr === expectedStr;
        } catch (err: any) {
          passed = false;
          allPassed = false;
          const stderr = err.stderr?.toString() || '';
          const stdout = err.stdout?.toString() || '';
          errorMsg = stderr || stdout || err.message || 'Runtime execution error';
          if (err.signal === 'SIGTERM' || err.killed) {
            errorMsg = 'Execution timed out';
          }
        }

        if (!passed) {
          allPassed = false;
        }

        testResults.push({
          passed,
          input: inputStr,
          expected: expectedStr,
          actual: actualStr,
          error: errorMsg || undefined,
        });
      }

      return {
        success: allPassed,
        testResults,
      };
    } finally {
      // Cleanup temp directory
      try {
        fs.rmSync(tempDir, { recursive: true, force: true });
      } catch (err) {
        this.logger.error('Failed to delete temporary directory:', err);
      }
    }
  }
}
