import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Gender } from '../entities/gender.entity';

@Injectable()
export class GenderSeeder {
  constructor(
    @InjectRepository(Gender)
    private readonly genderRepository: Repository<Gender>,
  ) {}

  async seed(): Promise<void> {
    const genders = [
      { id: 1, name: 'Male' },
      { id: 2, name: 'Female' },
    ];

    for (const gender of genders) {
      const exists = await this.genderRepository.findOne({ where: { id: gender.id } });
      if (!exists) {
        await this.genderRepository.save(gender);
      }
    }

    console.log('Gender seeder executed successfully.');
  }
}
