import { IsNotEmpty, IsString, IsDateString, IsOptional, IsInt } from 'class-validator';

export class CreateLeaveRequestDto {
  @IsNotEmpty()
  @IsString()
  reason: string;

  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @IsNotEmpty()
  @IsDateString()
  endDate: string;

  @IsInt()
  @IsNotEmpty()
  employeeId: number;
}
