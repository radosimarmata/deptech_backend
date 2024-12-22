import { IsNotEmpty, IsString, IsDateString, IsOptional } from 'class-validator';

export class UpdateLeaveRequestDto {
  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
