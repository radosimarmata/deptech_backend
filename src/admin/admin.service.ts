import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from '../entities/admin.entitiy';
import { Gender } from '../entities/gender.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
    private jwtService: JwtService,
    @InjectRepository(Gender)
    private genderRepository: Repository<Gender>,
  ) {}

  async createAdmin(data: Partial<Admin>, genderId: number): Promise<Admin> {
    try {
      const genderEntity = await this.genderRepository.findOne({ where: { id: genderId } });
      if (!genderEntity) {
        throw new HttpException('Invalid gender ID', HttpStatus.BAD_REQUEST);
      }

      const existingEmail = await this.adminRepository.findOne({ where: { email: data.email } });
      if (existingEmail) {
        throw new HttpException('Email already exists', HttpStatus.CONFLICT);
      }

      const existingName = await this.adminRepository.findOne({
        where: { firstName: data.firstName, lastName: data.lastName },
      });
      if (existingName) {
        throw new HttpException('Admin with this name already exists', HttpStatus.CONFLICT);
      }
      const admin = new Admin();
      admin.firstName = data.firstName;
      admin.lastName = data.lastName;
      admin.email = data.email;
      admin.birthDate = data.birthDate;
      admin.gender = genderEntity
      admin.password = await bcrypt.hash(data.password, 10); 

      return this.adminRepository.save(admin);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'An unexpected error occurred while creating admin',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAllAdmins(): Promise<Admin[]> {
    try {
      return this.adminRepository.find();
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve admins',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAdminById(id: number): Promise<Admin> {
    try {
      const admin = await this.adminRepository.findOne({ where: { id } });
      if (!admin) {
        throw new HttpException('Admin not found', HttpStatus.NOT_FOUND);
      }
      return admin;
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve admin',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateAdmin(id: number, data: Partial<Admin>, genderId?: number): Promise<Admin> {
    try {
      const admin = await this.getAdminById(id);
      admin.firstName = data.firstName || admin.firstName;
      admin.lastName = data.lastName || admin.lastName;
      admin.email = data.email || admin.email;
      admin.birthDate = data.birthDate || admin.birthDate;

      if (data.email && data.email !== admin.email) {
        const existingEmail = await this.adminRepository.findOne({ where: { email: data.email } });
        if (existingEmail) {
          throw new HttpException('Email already exists', HttpStatus.CONFLICT);
        }
        admin.email = data.email;
      }

      if (genderId) {
        const genderEntity = await this.genderRepository.findOne({ where: { id: genderId } });
        if (!genderEntity) {
          throw new Error('Invalid gender ID');
        }
        admin.gender = genderEntity;
      }
  
      if (data.password) {
        admin.password = await bcrypt.hash(data.password, 10);
      }
  
      return this.adminRepository.save(admin);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to update admin',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteAdmin(id: number): Promise<void> {
    try {
      const result = await this.adminRepository.delete(id);
      if (result.affected === 0) {
        throw new HttpException('Admin not found', HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to delete admin',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async loginAdmin(email: string, password: string): Promise<{admin: Admin; token: string}> {
    const admin = await this.adminRepository.findOne({ where: { email } });

    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    // Membuat payload untuk JWT
    const payload = { sub: admin.id, email: admin.email };
    const token = this.jwtService.sign(payload);

    return { admin, token };
  }
}