import { Entity, Unique, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn  } from 'typeorm';
import { LeaveRequest } from './leave-request.entity'; 
import { Gender } from './gender.entity';

@Entity()
@Unique(['firstName', 'lastName', 'email'])
export class Employee {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  email: string;

  @Column()
  phoneNumber: string;

  @Column()
  address: string;

  @ManyToOne(() => Gender, { eager: true })
  @JoinColumn({ name: 'gender_id' })
  gender: Gender;

  @OneToMany(() => LeaveRequest, (leaveRequest) => leaveRequest.employee)
  leaveRequests: LeaveRequest[];
}
