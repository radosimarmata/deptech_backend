import { Controller, Get, Post, Body, Param, Put, Delete,HttpException, HttpStatus} from '@nestjs/common';
import { AdminService } from './admin.service';
import { Admin } from '../entities/admin.entitiy';
import { AuthGuard } from '@nestjs/passport'; 

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post()
  async createAdmin(
    @Body() adminData: Partial<Admin>,
    @Body('genderId') genderId: number
  ): Promise<Admin> {
    return this.adminService.createAdmin(adminData, genderId);
  }

  @Get()
  async getAllAdmins(): Promise<Admin[]> {
    return this.adminService.getAllAdmins();
  }

  @Get(':id')
  async getAdminById(@Param('id') id: number): Promise<Admin> {
    return this.adminService.getAdminById(id);
  }

  @Put(':id')
  async updateAdmin(
    @Param('id') id: number, 
    @Body() adminData: Partial<Admin>,
    @Body('genderId') genderId?: number
  ): Promise<Admin> {
    return this.adminService.updateAdmin(id, adminData);
  }

  @Delete(':id')
  async deleteAdmin(@Param('id') id: number): Promise<void> {
    return this.adminService.deleteAdmin(id);
  }

  @Post('login')
  async login(@Body() body: { email: string, password: string }): Promise<{ admin: Admin; token: string }> {
    const { email, password } = body;
    const result = await this.adminService.loginAdmin(email, password);
    if (!result) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }
    return result;
  }
}
