# Time Management Seed Data Script
# This script inserts comprehensive test data via API calls
# Run: .\seed-data.ps1

$baseUrl = "http://localhost:3000/time-management"

# First, login to get a token (adjust credentials as needed)
Write-Host "Getting auth token..." -ForegroundColor Yellow
$loginBody = @{
    email = "admin@company.com"
    password = "Admin@123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.accessToken
    Write-Host "Login successful!" -ForegroundColor Green
} catch {
    Write-Host "Login failed. Using test data without auth..." -ForegroundColor Red
    $token = ""
}

$headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $token"
}

# ==================== SHIFT TYPES ====================
Write-Host "`n=== Creating Shift Types ===" -ForegroundColor Cyan

$shiftTypes = @(
    @{
        code = "MORNING"
        name = "Morning Shift"
        description = "Standard morning work hours from 8 AM to 4 PM"
        startTime = "08:00"
        endTime = "16:00"
        breakDurationMinutes = 60
        workingDays = @("MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY")
        color = "#4CAF50"
        isFlexible = $false
        flexibleStartRange = $null
        flexibleEndRange = $null
        active = $true
    },
    @{
        code = "EVENING"
        name = "Evening Shift"
        description = "Evening work hours from 4 PM to midnight"
        startTime = "16:00"
        endTime = "00:00"
        breakDurationMinutes = 45
        workingDays = @("MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY")
        color = "#2196F3"
        isFlexible = $false
        active = $true
    },
    @{
        code = "NIGHT"
        name = "Night Shift"
        description = "Night work hours from midnight to 8 AM"
        startTime = "00:00"
        endTime = "08:00"
        breakDurationMinutes = 45
        workingDays = @("MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY")
        color = "#9C27B0"
        isFlexible = $false
        active = $true
    },
    @{
        code = "FLEXIBLE"
        name = "Flexible Hours"
        description = "Flexible working hours with core hours requirement"
        startTime = "10:00"
        endTime = "16:00"
        breakDurationMinutes = 60
        workingDays = @("MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY")
        color = "#FF9800"
        isFlexible = $true
        flexibleStartRange = "07:00-10:00"
        flexibleEndRange = "16:00-20:00"
        active = $true
    },
    @{
        code = "SPLIT"
        name = "Split Shift"
        description = "Split shift with break in the middle"
        startTime = "06:00"
        endTime = "10:00"
        breakDurationMinutes = 240
        workingDays = @("MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY")
        color = "#E91E63"
        isFlexible = $false
        active = $true
    },
    @{
        code = "WEEKEND"
        name = "Weekend Shift"
        description = "Weekend coverage shift"
        startTime = "09:00"
        endTime = "17:00"
        breakDurationMinutes = 60
        workingDays = @("SATURDAY", "SUNDAY")
        color = "#607D8B"
        isFlexible = $false
        active = $true
    }
)

foreach ($shiftType in $shiftTypes) {
    try {
        $body = $shiftType | ConvertTo-Json -Depth 3
        Invoke-RestMethod -Uri "$baseUrl/shift-types" -Method POST -Body $body -Headers $headers
        Write-Host "Created shift type: $($shiftType.name)" -ForegroundColor Green
    } catch {
        Write-Host "Failed to create shift type: $($shiftType.name) - $($_.Exception.Message)" -ForegroundColor Red
    }
}

# ==================== OVERTIME RULES ====================
Write-Host "`n=== Creating Overtime Rules ===" -ForegroundColor Cyan

$overtimeRules = @(
    @{
        code = "OT-STANDARD"
        name = "Standard Overtime"
        description = "Standard overtime policy with 1.5x rate"
        minHoursBeforeOvertime = 8
        maxDailyOvertimeHours = 4
        maxWeeklyOvertimeHours = 20
        maxMonthlyOvertimeHours = 60
        weekdayRate = 1.5
        weekendRate = 2.0
        holidayRate = 2.5
        requiresApproval = $true
        autoApproveUpToHours = 2
        active = $true
    },
    @{
        code = "OT-SENIOR"
        name = "Senior Employee Overtime"
        description = "Enhanced overtime rates for senior employees"
        minHoursBeforeOvertime = 8
        maxDailyOvertimeHours = 6
        maxWeeklyOvertimeHours = 25
        maxMonthlyOvertimeHours = 80
        weekdayRate = 1.75
        weekendRate = 2.25
        holidayRate = 3.0
        requiresApproval = $true
        autoApproveUpToHours = 4
        active = $true
    },
    @{
        code = "OT-RESTRICTED"
        name = "Restricted Overtime"
        description = "Limited overtime for budget-constrained departments"
        minHoursBeforeOvertime = 9
        maxDailyOvertimeHours = 2
        maxWeeklyOvertimeHours = 8
        maxMonthlyOvertimeHours = 20
        weekdayRate = 1.25
        weekendRate = 1.5
        holidayRate = 2.0
        requiresApproval = $true
        autoApproveUpToHours = 0
        active = $true
    },
    @{
        code = "OT-EMERGENCY"
        name = "Emergency Overtime"
        description = "Special rates for emergency/on-call situations"
        minHoursBeforeOvertime = 0
        maxDailyOvertimeHours = 12
        maxWeeklyOvertimeHours = 40
        maxMonthlyOvertimeHours = 100
        weekdayRate = 2.0
        weekendRate = 2.5
        holidayRate = 3.5
        requiresApproval = $false
        autoApproveUpToHours = 12
        active = $true
    },
    @{
        code = "OT-PARTTIME"
        name = "Part-time Overtime"
        description = "Overtime policy for part-time employees"
        minHoursBeforeOvertime = 4
        maxDailyOvertimeHours = 4
        maxWeeklyOvertimeHours = 10
        maxMonthlyOvertimeHours = 30
        weekdayRate = 1.5
        weekendRate = 2.0
        holidayRate = 2.5
        requiresApproval = $true
        autoApproveUpToHours = 1
        active = $true
    }
)

foreach ($rule in $overtimeRules) {
    try {
        $body = $rule | ConvertTo-Json -Depth 3
        Invoke-RestMethod -Uri "$baseUrl/overtime-rules" -Method POST -Body $body -Headers $headers
        Write-Host "Created overtime rule: $($rule.name)" -ForegroundColor Green
    } catch {
        Write-Host "Failed to create overtime rule: $($rule.name) - $($_.Exception.Message)" -ForegroundColor Red
    }
}

# ==================== LATENESS RULES ====================
Write-Host "`n=== Creating Lateness Rules ===" -ForegroundColor Cyan

$latenessRules = @(
    @{
        code = "LATE-STANDARD"
        name = "Standard Lateness Policy"
        description = "Standard policy with 15-minute grace period"
        gracePeriodMinutes = 15
        deductionPerMinute = 0.5
        isPercentage = $false
        maxDeductionMinutes = 60
        warningThreshold = 3
        escalationThreshold = 5
        periodDays = 30
        autoDeduct = $false
        active = $true
    },
    @{
        code = "LATE-STRICT"
        name = "Strict Lateness Policy"
        description = "Strict policy for customer-facing roles"
        gracePeriodMinutes = 5
        deductionPerMinute = 1.0
        isPercentage = $false
        maxDeductionMinutes = 120
        warningThreshold = 2
        escalationThreshold = 3
        periodDays = 14
        autoDeduct = $true
        active = $true
    },
    @{
        code = "LATE-FLEXIBLE"
        name = "Flexible Lateness Policy"
        description = "Lenient policy for flexible work arrangements"
        gracePeriodMinutes = 30
        deductionPerMinute = 0
        isPercentage = $false
        maxDeductionMinutes = 0
        warningThreshold = 5
        escalationThreshold = 10
        periodDays = 60
        autoDeduct = $false
        active = $true
    },
    @{
        code = "LATE-PERCENT"
        name = "Percentage Deduction Policy"
        description = "Deductions calculated as percentage of daily wage"
        gracePeriodMinutes = 10
        deductionPerMinute = 0.25
        isPercentage = $true
        maxDeductionMinutes = 100
        warningThreshold = 3
        escalationThreshold = 6
        periodDays = 30
        autoDeduct = $true
        active = $true
    },
    @{
        code = "LATE-PROBATION"
        name = "Probation Lateness Policy"
        description = "Strict policy for employees on probation"
        gracePeriodMinutes = 0
        deductionPerMinute = 2.0
        isPercentage = $false
        maxDeductionMinutes = 240
        warningThreshold = 1
        escalationThreshold = 2
        periodDays = 7
        autoDeduct = $true
        active = $true
    }
)

foreach ($rule in $latenessRules) {
    try {
        $body = $rule | ConvertTo-Json -Depth 3
        Invoke-RestMethod -Uri "$baseUrl/lateness-rules" -Method POST -Body $body -Headers $headers
        Write-Host "Created lateness rule: $($rule.name)" -ForegroundColor Green
    } catch {
        Write-Host "Failed to create lateness rule: $($rule.name) - $($_.Exception.Message)" -ForegroundColor Red
    }
}

# ==================== HOLIDAYS ====================
Write-Host "`n=== Creating Holidays ===" -ForegroundColor Cyan

$holidays = @(
    @{ type = "NATIONAL"; name = "New Year's Day"; startDate = "2025-01-01"; active = $true },
    @{ type = "NATIONAL"; name = "MLK Day"; startDate = "2025-01-20"; active = $true },
    @{ type = "NATIONAL"; name = "Presidents Day"; startDate = "2025-02-17"; active = $true },
    @{ type = "NATIONAL"; name = "Memorial Day"; startDate = "2025-05-26"; active = $true },
    @{ type = "NATIONAL"; name = "Independence Day"; startDate = "2025-07-04"; active = $true },
    @{ type = "NATIONAL"; name = "Labor Day"; startDate = "2025-09-01"; active = $true },
    @{ type = "NATIONAL"; name = "Thanksgiving"; startDate = "2025-11-27"; active = $true },
    @{ type = "NATIONAL"; name = "Day After Thanksgiving"; startDate = "2025-11-28"; active = $true },
    @{ type = "NATIONAL"; name = "Christmas Eve"; startDate = "2025-12-24"; active = $true },
    @{ type = "NATIONAL"; name = "Christmas Day"; startDate = "2025-12-25"; active = $true },
    @{ type = "NATIONAL"; name = "New Year's Eve"; startDate = "2025-12-31"; active = $true },
    @{ type = "ORGANIZATIONAL"; name = "Company Foundation Day"; startDate = "2025-03-15"; active = $true },
    @{ type = "ORGANIZATIONAL"; name = "Annual Company Picnic"; startDate = "2025-06-15"; active = $true },
    @{ type = "ORGANIZATIONAL"; name = "Team Building Day"; startDate = "2025-09-20"; active = $true }
)

foreach ($holiday in $holidays) {
    try {
        $body = $holiday | ConvertTo-Json -Depth 3
        Invoke-RestMethod -Uri "$baseUrl/holidays" -Method POST -Body $body -Headers $headers
        Write-Host "Created holiday: $($holiday.name)" -ForegroundColor Green
    } catch {
        Write-Host "Failed to create holiday: $($holiday.name) - $($_.Exception.Message)" -ForegroundColor Red
    }
}

# ==================== SCHEDULE RULES ====================
Write-Host "`n=== Creating Schedule Rules ===" -ForegroundColor Cyan

$scheduleRules = @(
    @{
        code = "SCH-DEFAULT"
        name = "Default Schedule"
        description = "Standard 5-day work week schedule"
        workingDays = @("MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY")
        minDailyHours = 8
        maxDailyHours = 10
        minWeeklyHours = 40
        maxWeeklyHours = 50
        requiresBreak = $true
        minBreakMinutes = 30
        maxConsecutiveWorkDays = 6
        active = $true
    },
    @{
        code = "SCH-COMPRESSED"
        name = "Compressed Week"
        description = "4-day work week with longer hours"
        workingDays = @("MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY")
        minDailyHours = 10
        maxDailyHours = 12
        minWeeklyHours = 40
        maxWeeklyHours = 48
        requiresBreak = $true
        minBreakMinutes = 60
        maxConsecutiveWorkDays = 4
        active = $true
    },
    @{
        code = "SCH-SHIFT"
        name = "Shift Work Schedule"
        description = "Rotating shift schedule with varying days"
        workingDays = @("MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY")
        minDailyHours = 8
        maxDailyHours = 12
        minWeeklyHours = 36
        maxWeeklyHours = 48
        requiresBreak = $true
        minBreakMinutes = 45
        maxConsecutiveWorkDays = 5
        active = $true
    },
    @{
        code = "SCH-PARTTIME"
        name = "Part-time Schedule"
        description = "Reduced hours schedule for part-time employees"
        workingDays = @("MONDAY", "WEDNESDAY", "FRIDAY")
        minDailyHours = 4
        maxDailyHours = 6
        minWeeklyHours = 12
        maxWeeklyHours = 20
        requiresBreak = $false
        minBreakMinutes = 0
        maxConsecutiveWorkDays = 3
        active = $true
    }
)

foreach ($rule in $scheduleRules) {
    try {
        $body = $rule | ConvertTo-Json -Depth 3
        Invoke-RestMethod -Uri "$baseUrl/schedule-rules" -Method POST -Body $body -Headers $headers
        Write-Host "Created schedule rule: $($rule.name)" -ForegroundColor Green
    } catch {
        Write-Host "Failed to create schedule rule: $($rule.name) - $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n=== Seed Data Complete ===" -ForegroundColor Green
Write-Host "Created:" -ForegroundColor Yellow
Write-Host "  - $($shiftTypes.Count) Shift Types"
Write-Host "  - $($overtimeRules.Count) Overtime Rules"
Write-Host "  - $($latenessRules.Count) Lateness Rules"
Write-Host "  - $($holidays.Count) Holidays"
Write-Host "  - $($scheduleRules.Count) Schedule Rules"
