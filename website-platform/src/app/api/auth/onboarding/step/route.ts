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

export async function PATCH(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { step } = await request.json();

    if (step === undefined || typeof step !== 'number') {
      return NextResponse.json(
        { success: false, message: 'Valid step number is required' },
        { status: 400 }
      );
    }

    if (step < 1 || step > 5) {
      return NextResponse.json(
        { success: false, message: 'Step must be between 1 and 5' },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = { onboardingStep: step };

    if (step === 5) {
      updateData.onboardingCompletedAt = new Date();
    }

    await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    if (step === 5) {
      await prisma.userOnboardingMilestone.upsert({
        where: { userId_milestone: { userId, milestone: 'first_website' } },
        update: {},
        create: { userId, milestone: 'first_website' },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Onboarding step updated',
      data: {
        step,
        stepName: ONBOARDING_STEPS[step],
      },
    });
  } catch (error) {
    console.error('Update onboarding step error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
