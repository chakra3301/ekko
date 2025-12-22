// Artist onboarding page - 5-step guided form
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PortfolioUpload } from '@/components/portfolio/PortfolioUpload';
import { TagList } from '@/components/ui/TagList';
import type { UploadedMedia } from '@/lib/portfolio-upload';
import type { AvailabilityStatus } from '@/components/ui/AvailabilityPill';

type Step = 1 | 2 | 3 | 4 | 5;

interface OnboardingData {
  displayName: string;
  disciplines: string[];
  bio: string;
  tools: string[];
  availability: AvailabilityStatus;
  portfolioItems: UploadedMedia[];
}

/**
 * Artist onboarding page
 * 5-step guided form for artist profile creation
 */
export default function ArtistOnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<OnboardingData>({
    displayName: '',
    disciplines: [],
    bio: '',
    tools: [],
    availability: 'OPEN',
    portfolioItems: [],
  });

  const [tempDiscipline, setTempDiscipline] = useState('');
  const [tempTool, setTempTool] = useState('');

  const steps = [
    { number: 1, title: 'Display Name' },
    { number: 2, title: 'Disciplines' },
    { number: 3, title: 'Bio' },
    { number: 4, title: 'Tools' },
    { number: 5, title: 'Portfolio' },
  ];

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep((prev) => (prev + 1) as Step);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as Step);
    }
  };

  const addDiscipline = () => {
    if (tempDiscipline.trim() && !data.disciplines.includes(tempDiscipline.trim())) {
      setData((prev) => ({
        ...prev,
        disciplines: [...prev.disciplines, tempDiscipline.trim()],
      }));
      setTempDiscipline('');
    }
  };

  const removeDiscipline = (index: number) => {
    setData((prev) => ({
      ...prev,
      disciplines: prev.disciplines.filter((_, i) => i !== index),
    }));
  };

  const addTool = () => {
    if (tempTool.trim() && !data.tools.includes(tempTool.trim())) {
      setData((prev) => ({
        ...prev,
        tools: [...prev.tools, tempTool.trim()],
      }));
      setTempTool('');
    }
  };

  const removeTool = (index: number) => {
    setData((prev) => ({
      ...prev,
      tools: prev.tools.filter((_, i) => i !== index),
    }));
  };

  const handlePortfolioUpload = (media: UploadedMedia[]) => {
    setData((prev) => ({
      ...prev,
      portfolioItems: [...prev.portfolioItems, ...media],
    }));
  };

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 1:
        return data.displayName.trim().length > 0;
      case 2:
        return data.disciplines.length > 0;
      case 3:
        return true; // Bio is optional
      case 4:
        return data.tools.length > 0;
      case 5:
        // Require at least 3 portfolio items for submission
        return data.portfolioItems.length >= 3;
      default:
        return false;
    }
  };

  // Validation error helper (currently unused but kept for future use)
  // const _getValidationError = (): string | null => {
  //   if (currentStep === 5 && data.portfolioItems.length < 3) {
  //     return 'Please upload at least 3 portfolio items';
  //   }
  //   return null;
  // };

  const handleSubmit = async () => {
    if (!canProceed()) {
      setError('Please complete all required fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/onboarding/artist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          displayName: data.displayName,
          disciplines: data.disciplines,
          bio: data.bio || undefined,
          tools: data.tools,
          availability: data.availability,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create profile');
      }

      // Redirect to profile page or dashboard
      router.push(`/artist/${result.profile.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      currentStep >= step.number
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {step.number}
                  </div>
                  <span className="mt-2 text-xs text-gray-600 text-center">
                    {step.title}
                  </span>
                </div>
                {step.number < 5 && (
                  <div
                    className={`h-1 flex-1 mx-2 ${
                      currentStep > step.number ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          {error && (
            <div className="mb-6 rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Step 1: Display Name */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">What&apos;s your display name?</h2>
              <p className="text-gray-600">
                This is how clients will see you on EKKO.
              </p>
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
                  Display Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="displayName"
                  value={data.displayName}
                  onChange={(e) =>
                    setData((prev) => ({ ...prev, displayName: e.target.value }))
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                  placeholder="e.g., John Doe Photography"
                  maxLength={100}
                />
              </div>
            </div>
          )}

          {/* Step 2: Disciplines */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">What are your disciplines?</h2>
              <p className="text-gray-600">
                Add the types of work you specialize in.
              </p>
              <div>
                <label htmlFor="discipline" className="block text-sm font-medium text-gray-700">
                  Discipline <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 flex gap-2">
                  <input
                    type="text"
                    id="discipline"
                    value={tempDiscipline}
                    onChange={(e) => setTempDiscipline(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addDiscipline())}
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                    placeholder="e.g., Photography, Illustration"
                  />
                  <button
                    type="button"
                    onClick={addDiscipline}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
                {data.disciplines.length > 0 && (
                  <div className="mt-4">
                    <TagList tags={data.disciplines} />
                    <div className="mt-2 flex flex-wrap gap-2">
                      {data.disciplines.map((_, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => removeDiscipline(index)}
                          className="text-xs text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Bio */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Tell us about yourself</h2>
              <p className="text-gray-600">
                Write a brief bio that showcases your expertise and style.
              </p>
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                  Bio
                </label>
                <textarea
                  id="bio"
                  value={data.bio}
                  onChange={(e) => setData((prev) => ({ ...prev, bio: e.target.value }))}
                  rows={6}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                  placeholder="Describe your artistic style, experience, and what makes your work unique..."
                  maxLength={2000}
                />
                <p className="mt-1 text-xs text-gray-500">
                  {data.bio.length}/2000 characters
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Tools */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">What tools do you use?</h2>
              <p className="text-gray-600">
                List the software, equipment, or techniques you work with.
              </p>
              <div>
                <label htmlFor="tool" className="block text-sm font-medium text-gray-700">
                  Tool <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 flex gap-2">
                  <input
                    type="text"
                    id="tool"
                    value={tempTool}
                    onChange={(e) => setTempTool(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTool())}
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                    placeholder="e.g., Adobe Photoshop, Canon EOS R5"
                  />
                  <button
                    type="button"
                    onClick={addTool}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
                {data.tools.length > 0 && (
                  <div className="mt-4">
                    <TagList tags={data.tools} />
                    <div className="mt-2 flex flex-wrap gap-2">
                      {data.tools.map((_, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => removeTool(index)}
                          className="text-xs text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 5: Portfolio & Availability */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Showcase your work</h2>
                <p className="text-gray-600">
                  Upload at least 3 portfolio items to showcase your best work.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Availability <span className="text-red-500">*</span>
                </label>
                <select
                  value={data.availability}
                  onChange={(e) =>
                    setData((prev) => ({
                      ...prev,
                      availability: e.target.value as AvailabilityStatus,
                    }))
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                >
                  <option value="OPEN">Open - Available for new work</option>
                  <option value="LIMITED">Limited - Limited availability</option>
                  <option value="CLOSED">Closed - Not accepting new work</option>
                </select>
              </div>

              <PortfolioUpload
                onUpload={handlePortfolioUpload}
                maxFiles={10}
                required
              />

              {data.portfolioItems.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">
                    Uploaded: {data.portfolioItems.length} item(s)
                  </p>
                  {data.portfolioItems.length < 3 && (
                    <div className="rounded-md bg-yellow-50 p-4">
                      <p className="text-sm text-yellow-800 font-medium">
                        ⚠️ Please upload at least 3 portfolio items (required)
                      </p>
                      <p className="text-xs text-yellow-600 mt-1">
                        {3 - data.portfolioItems.length} more item(s) needed
                      </p>
                    </div>
                  )}
                </div>
              )}
              
              {data.portfolioItems.length === 0 && (
                <div className="mt-4 rounded-md bg-yellow-50 p-4">
                  <p className="text-sm text-yellow-800 font-medium">
                    ⚠️ At least 3 portfolio items are required
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Navigation buttons */}
          <div className="mt-8 flex justify-between">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Back
            </button>
            {currentStep < 5 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={!canProceed()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canProceed() || loading}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Profile...' : 'Complete Onboarding'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

