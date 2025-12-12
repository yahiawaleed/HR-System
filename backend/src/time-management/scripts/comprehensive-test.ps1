# Comprehensive Time Management API Test Script
# Tests all major endpoints and workflows

$baseUrl = "http://localhost:3000/time-management"
$authUrl = "http://localhost:3000/auth/login"

# Authentication
Write-Host "`n========== AUTHENTICATION ==========" -ForegroundColor Cyan
$loginBody = '{"email":"ahmed.hassan@company.com","password":"Password@EMP-ADMIN-001"}'
try {
    $login = Invoke-RestMethod -Uri $authUrl -Method POST -Body $loginBody -ContentType "application/json"
    $token = $login.accessToken
    Write-Host "✓ Login successful" -ForegroundColor Green
} catch {
    Write-Host "✗ Login failed: $_" -ForegroundColor Red
    exit 1
}

$headers = @{
    Authorization = "Bearer $token"
    "Content-Type" = "application/json"
}

# Test counter
$passed = 0
$failed = 0

function Test-Endpoint {
    param($name, $method, $url, $body = $null)
    
    try {
        if ($body) {
            $result = Invoke-RestMethod -Uri $url -Method $method -Headers $headers -Body $body
        } else {
            $result = Invoke-RestMethod -Uri $url -Method $method -Headers $headers
        }
        Write-Host "  ✓ $name" -ForegroundColor Green
        $script:passed++
        return $result
    } catch {
        Write-Host "  ✗ $name - Error: $($_.Exception.Message)" -ForegroundColor Red
        $script:failed++
        return $null
    }
}

# 1. SHIFT TYPES
Write-Host "`n========== SHIFT TYPES ==========" -ForegroundColor Cyan
$shiftTypes = Test-Endpoint "GET shift-types" "GET" "$baseUrl/shift-types"
Write-Host "    Count: $($shiftTypes.Count)" -ForegroundColor Gray

# 2. OVERTIME RULES  
Write-Host "`n========== OVERTIME RULES ==========" -ForegroundColor Cyan
$overtimeRules = Test-Endpoint "GET overtime-rules" "GET" "$baseUrl/overtime-rules"
Write-Host "    Count: $($overtimeRules.Count)" -ForegroundColor Gray

# 3. LATENESS RULES
Write-Host "`n========== LATENESS RULES ==========" -ForegroundColor Cyan
$latenessRules = Test-Endpoint "GET lateness-rules" "GET" "$baseUrl/lateness-rules"
Write-Host "    Count: $($latenessRules.Count)" -ForegroundColor Gray

# 4. HOLIDAYS
Write-Host "`n========== HOLIDAYS ==========" -ForegroundColor Cyan
$holidays = Test-Endpoint "GET holidays" "GET" "$baseUrl/holidays"
Write-Host "    Count: $($holidays.Count)" -ForegroundColor Gray

# 5. SCHEDULE RULES
Write-Host "`n========== SCHEDULE RULES ==========" -ForegroundColor Cyan
$scheduleRules = Test-Endpoint "GET schedule-rules" "GET" "$baseUrl/schedule-rules"
Write-Host "    Count: $($scheduleRules.Count)" -ForegroundColor Gray

# 6. SHIFTS / ASSIGNMENTS
Write-Host "`n========== SHIFTS ==========" -ForegroundColor Cyan
$shifts = Test-Endpoint "GET shifts" "GET" "$baseUrl/shifts"
Write-Host "    Count: $($shifts.Count)" -ForegroundColor Gray

# 7. ATTENDANCE
Write-Host "`n========== ATTENDANCE ==========" -ForegroundColor Cyan
$attendance = Test-Endpoint "GET attendance" "GET" "$baseUrl/attendance"
Write-Host "    Count: $($attendance.Count)" -ForegroundColor Gray

# 8. CORRECTIONS
Write-Host "`n========== CORRECTIONS ==========" -ForegroundColor Cyan
$corrections = Test-Endpoint "GET corrections" "GET" "$baseUrl/corrections"
Write-Host "    Count: $($corrections.Count)" -ForegroundColor Gray

$pending = Test-Endpoint "GET pending corrections" "GET" "$baseUrl/corrections/pending"

# 9. PUNCH POLICY
Write-Host "`n========== SETTINGS ==========" -ForegroundColor Cyan
$punchPolicy = Test-Endpoint "GET punch-policy" "GET" "$baseUrl/settings/punch-policy"
if ($punchPolicy) {
    Write-Host "    Policy: $($punchPolicy.value)" -ForegroundColor Gray
}

# 10. REPORTS
Write-Host "`n========== REPORTS ==========" -ForegroundColor Cyan
$reportBody = '{"startDate":"2025-11-01","endDate":"2025-12-31"}'

$attendanceReport = Test-Endpoint "POST attendance report" "POST" "$baseUrl/reports/attendance" $reportBody
if ($attendanceReport) {
    Write-Host "    Records: $($attendanceReport.summary.totalRecords), Late: $($attendanceReport.summary.lateCount), MissedPunch: $($attendanceReport.summary.missedPunchCount)" -ForegroundColor Gray
}

$overtimeReport = Test-Endpoint "POST overtime report" "POST" "$baseUrl/reports/overtime" $reportBody
if ($overtimeReport) {
    Write-Host "    Overtime Records: $($overtimeReport.totalRecords)" -ForegroundColor Gray
}

$latenessReport = Test-Endpoint "POST lateness report" "POST" "$baseUrl/reports/lateness" $reportBody
if ($latenessReport) {
    Write-Host "    Late Records: $($latenessReport.totalRecords)" -ForegroundColor Gray
}

$exceptionsReport = Test-Endpoint "POST exceptions report" "POST" "$baseUrl/reports/exceptions" $reportBody
if ($exceptionsReport) {
    Write-Host "    Exception Records: $($exceptionsReport.totalRecords)" -ForegroundColor Gray
}

# 11. COMPLEX WORKFLOW: Clock-in and Clock-out
Write-Host "`n========== CLOCK IN/OUT WORKFLOW ==========" -ForegroundColor Cyan
$employeeId = "6938bda5cd3b72ce6617d314"  # Ahmed Hassan

# Clock-in
$clockInBody = "{`"employeeId`":`"$employeeId`"}"
$clockIn = Test-Endpoint "POST clock-in" "POST" "$baseUrl/attendance/clock-in" $clockInBody
if ($clockIn) {
    Write-Host "    Clock-in: $($clockIn.message)" -ForegroundColor Gray
}

# Get my today's attendance
$myToday = Test-Endpoint "GET my-today" "GET" "$baseUrl/attendance/my-today"
if ($myToday) {
    Write-Host "    Today's punches: $($myToday.punches.Count)" -ForegroundColor Gray
}

# Clock-out
$clockOutBody = "{`"employeeId`":`"$employeeId`"}"
$clockOut = Test-Endpoint "POST clock-out" "POST" "$baseUrl/attendance/clock-out" $clockOutBody
if ($clockOut) {
    Write-Host "    Clock-out: $($clockOut.message)" -ForegroundColor Gray
}

# 12. CREATE AND DELETE TEST
Write-Host "`n========== CREATE/DELETE TEST ==========" -ForegroundColor Cyan
$testHolidayBody = '{"name":"Test Holiday","startDate":"2025-12-25","endDate":"2025-12-25","type":"NATIONAL","description":"Test","active":true}'
$testHoliday = Test-Endpoint "POST create holiday" "POST" "$baseUrl/holidays" $testHolidayBody
if ($testHoliday -and $testHoliday._id) {
    Write-Host "    Created: $($testHoliday.name) (ID: $($testHoliday._id))" -ForegroundColor Gray
    
    # Delete it
    $deleteResult = Test-Endpoint "DELETE holiday" "DELETE" "$baseUrl/holidays/$($testHoliday._id)"
    Write-Host "    Deleted test holiday" -ForegroundColor Gray
}

# SUMMARY
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "          TEST SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Passed: $passed" -ForegroundColor Green
Write-Host "  Failed: $failed" -ForegroundColor $(if($failed -gt 0){"Red"}else{"Green"})
Write-Host "  Total:  $($passed + $failed)" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

if ($failed -eq 0) {
    Write-Host "All tests passed! ✓" -ForegroundColor Green
} else {
    Write-Host "Some tests failed! ✗" -ForegroundColor Red
}
