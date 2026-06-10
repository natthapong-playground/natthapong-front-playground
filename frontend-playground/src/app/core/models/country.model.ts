export interface Country {
  code: string;            
  name: string;
  timezone: string;       
  utcOffsetMinutes: number;
  utcOffsetLabel: string;   
  localTime: string;       
  flagEmoji?: string;       
}

export interface ClockSnapshot {
  referenceUtc: string;     
  countries: Country[];     
}