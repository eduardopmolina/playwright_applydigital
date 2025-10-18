/**
 * BDD Logger for Playwright Tests
 * Generates Markdown reports using Behavior-Driven Development language (Given-When-Then)
 */

import { writeFileSync, appendFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export interface BDDStep {
  type: 'Given' | 'When' | 'Then' | 'And' | 'But';
  description: string;
  status: 'pending' | 'passed' | 'failed' | 'skipped';
  timestamp: Date;
  screenshot?: string;
  error?: string;
  details?: Record<string, any>;
}

export interface BDDScenario {
  title: string;
  feature: string;
  tags: string[];
  background?: string;
  steps: BDDStep[];
  status: 'pending' | 'passed' | 'failed' | 'skipped';
  startTime: Date;
  endTime?: Date;
  duration?: number;
  browser?: string;
  viewport?: string;
}

export class BDDLogger {
  private readonly scenarios: BDDScenario[] = [];
  private currentScenario: BDDScenario | null = null;
  private readonly reportPath: string;
  private readonly featureName: string;

  constructor(featureName: string, reportDir: string = 'reports/bdd') {
    this.featureName = featureName;
    // eslint-disable-next-line unicorn/prefer-string-replace-all
    this.reportPath = join(reportDir, `${featureName.toLowerCase().replace(/\s+/g, '-')}-bdd-report.md`);
    
    // Create reports directory if it doesn't exist
    if (!existsSync(reportDir)) {
      mkdirSync(reportDir, { recursive: true });
    }

    this.initializeReport();
  }

  private initializeReport(): void {
    const header = `# BDD Test Report: ${this.featureName}

**Generated:** ${new Date().toLocaleString()}  
**Test Suite:** Playwright E-commerce Automation  
**Feature:** ${this.featureName}

---

## Test Summary
- **Total Scenarios:** 0
- **Passed:** 0
- **Failed:** 0
- **Skipped:** 0
- **Pending:** 0

---

## Scenarios

`;
    writeFileSync(this.reportPath, header, 'utf8');
  }

  /**
   * Start a new BDD scenario
   */
  startScenario(
    title: string, 
    tags: string[] = [], 
    background?: string, 
    browser?: string, 
    viewport?: string
  ): void {
    this.currentScenario = {
      title,
      feature: this.featureName,
      tags,
      background,
      steps: [],
      status: 'pending',
      startTime: new Date(),
      browser,
      viewport
    };

    console.log(`\n🎬 Starting BDD Scenario: ${title}`);
    if (tags.length > 0) {
      console.log(`   Tags: ${tags.join(', ')}`);
    }
  }

  /**
   * Add a Given step (preconditions)
   */
  given(description: string, details?: Record<string, any>): void {
    this.addStep('Given', description, details);
  }

  /**
   * Add a When step (actions)
   */
  when(description: string, details?: Record<string, any>): void {
    this.addStep('When', description, details);
  }

  /**
   * Add a Then step (expected outcomes)
   */
  thenStep(description: string, details?: Record<string, any>): void {
    this.addStep('Then', description, details);
  }

  /**
   * Add an And step (additional conditions/actions/outcomes)
   */
  and(description: string, details?: Record<string, any>): void {
    this.addStep('And', description, details);
  }

  /**
   * Add a But step (contrasting conditions/actions/outcomes)
   */
  but(description: string, details?: Record<string, any>): void {
    this.addStep('But', description, details);
  }

  private addStep(type: BDDStep['type'], description: string, details?: Record<string, any>): void {
    if (!this.currentScenario) {
      throw new Error('No scenario started. Call startScenario() first.');
    }

    const step: BDDStep = {
      type,
      description,
      status: 'pending',
      timestamp: new Date(),
      details
    };

    this.currentScenario.steps.push(step);
    console.log(`   ${this.getStepIcon(type)} ${type} ${description}`);
  }

  /**
   * Mark the current step as passed
   */
  stepPassed(screenshot?: string): void {
    if (this.currentScenario && this.currentScenario.steps.length > 0) {
      const lastIndex = this.currentScenario.steps.length - 1;
      const currentStep = this.currentScenario.steps[lastIndex];
      if (currentStep) {
        currentStep.status = 'passed';
        currentStep.screenshot = screenshot;
        console.log(`      ✅ Step passed`);
      }
    }
  }

  /**
   * Mark the current step as failed
   */
  stepFailed(error: string, screenshot?: string): void {
    if (this.currentScenario && this.currentScenario.steps.length > 0) {
      const lastIndex = this.currentScenario.steps.length - 1;
      const currentStep = this.currentScenario.steps[lastIndex];
      if (currentStep) {
        currentStep.status = 'failed';
        currentStep.error = error;
        currentStep.screenshot = screenshot;
        console.log(`      ❌ Step failed: ${error}`);
      }
    }
  }

  /**
   * Mark the current step as skipped
   */
  stepSkipped(reason?: string): void {
    if (this.currentScenario && this.currentScenario.steps.length > 0) {
      const lastIndex = this.currentScenario.steps.length - 1;
      const currentStep = this.currentScenario.steps[lastIndex];
      if (currentStep) {
        currentStep.status = 'skipped';
        currentStep.error = reason;
        console.log(`      ⏭️ Step skipped: ${reason || 'No reason provided'}`);
      }
    }
  }

  /**
   * End the current scenario and calculate its status
   */
  endScenario(): void {
    if (!this.currentScenario) {
      throw new Error('No scenario to end.');
    }

    this.currentScenario.endTime = new Date();
    this.currentScenario.duration = this.currentScenario.endTime.getTime() - this.currentScenario.startTime.getTime();

    // Calculate scenario status based on steps
    const stepStatuses = this.currentScenario.steps.map(step => step.status);
    if (stepStatuses.includes('failed')) {
      this.currentScenario.status = 'failed';
    } else if (stepStatuses.includes('pending')) {
      this.currentScenario.status = 'pending';
    } else if (stepStatuses.every(status => status === 'skipped')) {
      this.currentScenario.status = 'skipped';
    } else {
      this.currentScenario.status = 'passed';
    }

    this.scenarios.push(this.currentScenario);
    console.log(`\n🏁 Scenario ended: ${this.getStatusIcon(this.currentScenario.status)} ${this.currentScenario.status.toUpperCase()}`);
    console.log(`   Duration: ${this.currentScenario.duration}ms`);

    this.writeScenarioToReport(this.currentScenario);
    this.currentScenario = null;
  }

  private writeScenarioToReport(scenario: BDDScenario): void {
    const statusIcon = this.getStatusIcon(scenario.status);
    const durationText = scenario.duration ? `(${scenario.duration}ms)` : '';
    
    let scenarioMd = `\n### ${statusIcon} Scenario: ${scenario.title} ${durationText}\n\n`;
    
    if (scenario.tags.length > 0) {
      scenarioMd += `**Tags:** \`${scenario.tags.join('` `')}\`\n\n`;
    }

    if (scenario.browser || scenario.viewport) {
      scenarioMd += `**Environment:**\n`;
      if (scenario.browser) scenarioMd += `- Browser: ${scenario.browser}\n`;
      if (scenario.viewport) scenarioMd += `- Viewport: ${scenario.viewport}\n`;
      scenarioMd += `\n`;
    }

    if (scenario.background) {
      scenarioMd += `**Background:** ${scenario.background}\n\n`;
    }

    scenarioMd += `**Steps:**\n\n`;
    
    for (const [index, step] of scenario.steps.entries()) {
      const stepIcon = this.getStatusIcon(step.status);
      const stepNumber = (index + 1).toString().padStart(2, '0');
      
      scenarioMd += `${stepNumber}. ${stepIcon} **${step.type}** ${step.description}\n`;
      
      if (step.error) {
        scenarioMd += `    - ❌ **Error:** ${step.error}\n`;
      }
      
      if (step.details) {
        scenarioMd += `    - 📋 **Details:** ${JSON.stringify(step.details, null, 2)}\n`;
      }
      
      if (step.screenshot) {
        scenarioMd += `    - 📸 **Screenshot:** ${step.screenshot}\n`;
      }
      
      scenarioMd += `    - ⏰ **Timestamp:** ${step.timestamp.toLocaleString()}\n\n`;
    }

    scenarioMd += `---\n`;

    appendFileSync(this.reportPath, scenarioMd, 'utf8');
  }

  /**
   * Generate final report with summary statistics
   */
  generateReport(): string {
    this.updateSummaryStatistics();
    console.log(`\n📊 BDD Report generated: ${this.reportPath}`);
    return this.reportPath;
  }

  private updateSummaryStatistics(): void {
    const total = this.scenarios.length;
    const passed = this.scenarios.filter(s => s.status === 'passed').length;
    const failed = this.scenarios.filter(s => s.status === 'failed').length;
    const skipped = this.scenarios.filter(s => s.status === 'skipped').length;
    const pending = this.scenarios.filter(s => s.status === 'pending').length;

    // Read the current report
    const reportContent = readFileSync(this.reportPath, 'utf8');
    
    // Update the summary section
    const updatedContent = reportContent.replace(
      /## Test Summary[\s\S]*?---/,
      `## Test Summary
- **Total Scenarios:** ${total}
- **Passed:** ${passed} ${passed > 0 ? '✅' : ''}
- **Failed:** ${failed} ${failed > 0 ? '❌' : ''}
- **Skipped:** ${skipped} ${skipped > 0 ? '⏭️' : ''}
- **Pending:** ${pending} ${pending > 0 ? '⏳' : ''}

**Success Rate:** ${total > 0 ? Math.round((passed / total) * 100) : 0}%

---`
    );

    writeFileSync(this.reportPath, updatedContent, 'utf8');
  }

  private getStepIcon(type: BDDStep['type']): string {
    const icons: Record<string, string> = {
      'Given': '📋',
      'When': '🎯',
      'Then': '✅',
      'And': '➕',
      'But': '❗'
    };
    return icons[type] || '📝';
  }

  private getStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      'passed': '✅',
      'failed': '❌',
      'skipped': '⏭️',
      'pending': '⏳'
    };
    return icons[status] || '❓';
  }

  /**
   * Get current scenario information
   */
  getCurrentScenario(): BDDScenario | null {
    return this.currentScenario;
  }

  /**
   * Get all scenarios
   */
  getAllScenarios(): BDDScenario[] {
    return [...this.scenarios];
  }

  /**
   * Add a note to the current step
   */
  addNote(note: string): void {
    if (this.currentScenario && this.currentScenario.steps.length > 0) {
      const lastIndex = this.currentScenario.steps.length - 1;
      const currentStep = this.currentScenario.steps[lastIndex];
      if (currentStep) {
        if (!currentStep.details) {
          currentStep.details = {};
        }
        if (!currentStep.details.notes) {
          currentStep.details.notes = [];
        }
        currentStep.details.notes.push(note);
        console.log(`      💡 Note: ${note}`);
      }
    }
  }

  /**
   * Add API call details to the current step
   */
  logApiCall(method: string, url: string, status: number, responseTime?: number): void {
    const apiDetails = {
      method,
      url,
      status,
      responseTime: responseTime ? `${responseTime}ms` : undefined,
      timestamp: new Date().toISOString()
    };
    
    if (this.currentScenario && this.currentScenario.steps.length > 0) {
      const lastIndex = this.currentScenario.steps.length - 1;
      const currentStep = this.currentScenario.steps[lastIndex];
      if (currentStep) {
        if (!currentStep.details) {
          currentStep.details = {};
        }
        if (!currentStep.details.apiCalls) {
          currentStep.details.apiCalls = [];
        }
        currentStep.details.apiCalls.push(apiDetails);
      }
    }
    
    const timeText = responseTime ? ` (${responseTime}ms)` : '';
    console.log(`      🌐 API: ${method} ${url} → ${status}${timeText}`);
  }
}

/**
 * Utility function to create a BDD logger instance
 */
export function createBDDLogger(featureName: string, reportDir?: string): BDDLogger {
  return new BDDLogger(featureName, reportDir);
}