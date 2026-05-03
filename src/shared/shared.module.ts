import { Module } from '@nestjs/common';
import { IsFleetNumberConstraint } from './fleet-number.validator';
import { IsGuideNumberConstraint } from './guide-number.validator';
import { IsVehiclePlateConstraint } from './plate.validator';

@Module({
  providers: [
    IsVehiclePlateConstraint,
    IsFleetNumberConstraint,
    IsGuideNumberConstraint,
  ],
  exports: [
    IsVehiclePlateConstraint,
    IsFleetNumberConstraint,
    IsGuideNumberConstraint,
  ],
})
export class SharedModule {}
