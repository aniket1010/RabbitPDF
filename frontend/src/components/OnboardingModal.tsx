'use client';

import { useState } from 'react';
import { useSession } from '@/lib/auth-client';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Spinner from './Spinner';
import { 
  User, 
  Briefcase, 
  GraduationCap, 
  Code, 
  Stethoscope, 
  Scale,
  Palette,
  Wrench,
  Users,
  FileText,
  MessageSquare,
  Zap,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

const USER_TYPES = [
  { id: 'student', label: 'Student', icon: GraduationCap, description: 'Reading papers and textbooks' },
  { id: 'researcher', label: 'Researcher', icon: FileText, description: 'Analyzing research documents' },
  { id: 'professional', label: 'Professional', icon: Briefcase, description: 'Working with business documents' },
  { id: 'developer', label: 'Developer', icon: Code, description: 'Technical documentation' },
  { id: 'lawyer', label: 'Legal Professional', icon: Scale, description: 'Legal documents and contracts' },
  { id: 'healthcare', label: 'Healthcare', icon: Stethoscope, description: 'Medical papers and guidelines' },
  { id: 'designer', label: 'Designer', icon: Palette, description: 'Design specs and briefs' },
  { id: 'consultant', label: 'Consultant', icon: Users, description: 'Client reports and proposals' },
  { id: 'other', label: 'Other', icon: Wrench, description: 'General document analysis' },
];

const USE_CASES = [
  { id: 'summarize', label: 'Summarize Documents', icon: FileText },
  { id: 'qa', label: 'Ask Questions', icon: MessageSquare },
  { id: 'research', label: 'Research Assistance', icon: GraduationCap },
  { id: 'analysis', label: 'Content Analysis', icon: Zap },
];

export function OnboardingModal({ isOpen, onComplete }: OnboardingModalProps) {
  const { data: session } = useSession();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    userType: '',
    useCases: [] as string[],
    goals: '',
    notifications: true,
  });

  const handleUserTypeSelect = (userType: string) => {
    setFormData(prev => ({ ...prev, userType }));
  };

  const handleUseCaseToggle = (useCase: string) => {
    setFormData(prev => ({
      ...prev,
      useCases: prev.useCases.includes(useCase)
        ? prev.useCases.filter(uc => uc !== useCase)
        : [...prev.useCases, useCase]
    }));
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      // Save onboarding data to your backend
      const response = await fetch('/api/user/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session?.user?.id,
          onboardingData: formData,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save onboarding data');
      }

      toast.success('Welcome to ChatPDF! 🎉');
      onComplete();
    } catch (error) {
      console.error('Onboarding error:', error);
      toast.error('Failed to complete onboarding');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold">Welcome to ChatPDF! 🎉</h2>
            <p className="text-muted-foreground">
              Let's personalize your experience in just a few steps
            </p>
            <div className="flex justify-center space-x-2 mt-4">
              {[1, 2, 3].map((stepNumber) => (
                <div
                  key={stepNumber}
                  className={`w-8 h-2 rounded-full transition-colors ${
                    step >= stepNumber ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Step 1: User Type */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold">What describes you best?</h3>
                <p className="text-sm text-muted-foreground">
                  This helps us customize ChatPDF for your needs
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {USER_TYPES.map((type) => {
                  const Icon = type.icon;
                  const isSelected = formData.userType === type.id;
                  
                  return (
                    <Card
                      key={type.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
                      }`}
                      onClick={() => handleUserTypeSelect(type.id)}
                    >
                      <CardContent className="p-4 text-center space-y-2">
                        <Icon className={`h-6 w-6 mx-auto ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                        <div>
                          <p className="font-medium text-sm">{type.label}</p>
                          <p className="text-xs text-muted-foreground">{type.description}</p>
                        </div>
                        {isSelected && (
                          <CheckCircle className="h-4 w-4 text-primary mx-auto" />
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              
              <div className="flex justify-end">
                <Button 
                  onClick={() => setStep(2)} 
                  disabled={!formData.userType}
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Use Cases */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold">How do you plan to use ChatPDF?</h3>
                <p className="text-sm text-muted-foreground">
                  Select all that apply
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {USE_CASES.map((useCase) => {
                  const Icon = useCase.icon;
                  const isSelected = formData.useCases.includes(useCase.id);
                  
                  return (
                    <Card
                      key={useCase.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
                      }`}
                      onClick={() => handleUseCaseToggle(useCase.id)}
                    >
                      <CardContent className="p-4 flex items-center space-x-3">
                        <Icon className={`h-5 w-5 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                        <span className="font-medium text-sm">{useCase.label}</span>
                        {isSelected && (
                          <CheckCircle className="h-4 w-4 text-primary ml-auto" />
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button 
                  onClick={() => setStep(3)} 
                  disabled={formData.useCases.length === 0}
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Goals */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold">What are your main goals?</h3>
                <p className="text-sm text-muted-foreground">
                  Tell us what you want to achieve with ChatPDF
                </p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="goals" className="text-sm font-medium mb-2 block">
                    Your Goals (Optional)
                  </label>
                  <textarea
                    id="goals"
                    className="w-full min-h-[100px] p-3 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="e.g., I want to quickly understand research papers for my thesis, or I need to analyze legal documents efficiently..."
                    value={formData.goals}
                    onChange={(e) => setFormData(prev => ({ ...prev, goals: e.target.value }))}
                  />
                </div>

                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="notifications"
                        checked={formData.notifications}
                        onChange={(e) => setFormData(prev => ({ ...prev, notifications: e.target.checked }))}
                        className="rounded"
                      />
                      <label htmlFor="notifications" className="text-sm">
                        Send me tips and updates about new features
                      </label>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button onClick={handleComplete} disabled={loading}>
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <Spinner size={16} color="#ffffff" />
                      Completing...
                    </div>
                  ) : (
                    'Complete Setup'
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
