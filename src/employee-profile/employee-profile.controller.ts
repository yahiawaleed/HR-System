import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { EmployeeProfileService } from './employee-profile.service';

@Controller('employee-profile')
export class EmployeeProfileController {
    constructor(private readonly employeeService: EmployeeProfileService) { }

    @Post()
    create(@Body() createEmployeeDto: any) {
        return this.employeeService.create(createEmployeeDto);
    }

    @Get()
    findAll() {
        return this.employeeService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.employeeService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateEmployeeDto: any) {
        return this.employeeService.update(id, updateEmployeeDto);
    }

    @Patch(':id/onboard')
    async onboard(@Param('id') id: string, @Body() body: { payroll: boolean, it: boolean }) {
        return this.employeeService.update(id, {
            payrollEnabled: body.payroll,
            itAccessEnabled: body.it
        });
    }

    @Patch(':id/offboard')
    async offboard(@Param('id') id: string, @Body() body: { payroll: boolean, it: boolean }) {
        // For offboarding, we usually want to DISABLE things.
        // If the user sends { payroll: true } in the context of "Remove Payroll", 
        // it should mean payrollEnabled = false.
        // However, to be explicit and safe, let's assume the body contains the DESIRED status for the flags.
        // OR, we stick to the frontend's interpretation.
        // Frontend Offboarding: "Remove Payroll" button sends... well, we haven't wired the API call yet.
        // Let's assume the API receives the target state.

        return this.employeeService.update(id, {
            payrollEnabled: body.payroll,
            itAccessEnabled: body.it
        });
    }
}
