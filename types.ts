export enum Sender {
  User = 'user',
  Bot = 'bot',
}

export interface PlotDataset {
  label: string;
  data: number[];
  borderColor?: string;
  backgroundColor?: string;
  tension?: number;
}

export interface PlotData {
  type: 'line' | 'bar';
  data: {
    labels: string[];
    datasets: PlotDataset[];
  };
  title: string;
  xAxisLabel: string;
  yAxisLabel: string;
}


export interface Message {
  id: string;
  text: string;
  sender: Sender;
  imageUrl?: string; // For user-uploaded images
  metadata?: {
    sources?: {
      uri: string;
      title: string;
    }[];
  };
  plotData?: PlotData;
  schematicSvg?: string;
}