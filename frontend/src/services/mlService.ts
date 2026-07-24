import { apiClient } from './apiClient';

export interface LoanPredictionInput {
  gender?: 'Male' | 'Female';
  married?: 'Yes' | 'No';
  dependents?: number | string;
  education?: 'Graduate' | 'Not Graduate';
  self_employed?: 'Yes' | 'No';
  income: number;
  co_income?: number;
  loan_amount: number;
  loan_term?: number;
  credit_history?: number;
  property_area?: 'Urban' | 'Semiurban' | 'Rural';
}

export interface LoanPredictionOutput {
  eligible: boolean;
  approval_probability: number;
  recommended_loan: string;
  risk_level: 'Low' | 'Medium' | 'High';
  confidence: number;
  top_factors: string[];
}

export interface APIEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export const predictLoanEligibility = async (
  input: LoanPredictionInput
): Promise<LoanPredictionOutput> => {
  const response = (await apiClient.post('/ml/predict', input)) as unknown as APIEnvelope<LoanPredictionOutput>;
  return response.data;
};
