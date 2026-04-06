import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const ONBOARDING_STEPS: Record<number, string> = {
  0: 'Account Created',
  1: 'Profile Setup',
  2: 'First Website',
  3: 'Template Selection',
  4: 'Customization',
  5: 'Published',
};

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        onboardingStep: true,
        onboardingStartedAt: true,
        onboardingCompletedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    const milestones = await prisma.userOnboardingMilestone.findMany({
      where: { userId },
      orderBy: { awardedAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: {
        step: user.onboardingStep,
        stepName: ONBOARDING_STEPS[user.onboardingStep] || 'Unknown',
        startedAt: user.onboardingStartedAt,
        completedAt: user.onboardingCompletedAt,
        milestones: milestones.map((m) => ({
          milestone: m.milestone,
          awardedAt: m.awardedAt,
        })),
      },
    });
  } catch (error) {
    console.error('Get onboarding status error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
