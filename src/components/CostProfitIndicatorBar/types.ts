export interface CostProfitData {
  totalCost: number;
  grossProfitPercentage: number;
  price: number;
}

export interface CostProfitIndicatorProps {
  data: CostProfitData;
  className?: string;
  showValues?: boolean;
  height?: number;
}