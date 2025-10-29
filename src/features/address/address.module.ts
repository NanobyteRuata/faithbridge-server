import { Module } from '@nestjs/common';
import { AddressService } from './services/address.service';
import { CountryService } from './services/country.service';
import { StateService } from './services/state.service';
import { CityService } from './services/city.service';
import { TownshipService } from './services/township.service';
import { AddressController } from './controllers/address.controller';
import { CountryController } from './controllers/country.controller';
import { StateController } from './controllers/state.controller';
import { CityController } from './controllers/city.controller';
import { TownshipController } from './controllers/township.controller';

@Module({
  controllers: [
    AddressController,
    CountryController,
    StateController,
    CityController,
    TownshipController,
  ],
  providers: [
    AddressService,
    CountryService,
    StateService,
    CityService,
    TownshipService,
  ],
})
export class AddressModule {}
