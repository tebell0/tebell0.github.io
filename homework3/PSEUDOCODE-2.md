# Pseudocode for Form Validation System

## Start

1. **Declare Variables**:
   - `username`
   - `password`
   - `email`
   - `isValid`: Boolean

2. **Set isValid to true**

## Function: ValidateUsername
1. If `username` is empty:
   - Set `isValid` to false
   - Print "Username cannot be empty"
   - Return
2. If `username` length is less than 3:
   - Set `isValid` to false
   - Print "Username must be at least 3 characters"
   - Return

## Function: ValidatePassword
1. If `password` is empty:
   - Set `isValid` to false
   - Print "Password cannot be empty"
   - Return
2. If `password` length is less than 8:
   - Set `isValid` to false
   - Print "Password must be at least 8 characters"
   - Return
3. If `password` does not contain a number:
   - Set `isValid` to false
   - Print "Password must contain at least one number"
   - Return

## Function: ValidateEmail
1. If `email` is empty:
   - Set `isValid` to false
   - Print "Email cannot be empty"
   - Return
2. If `email` format is invalid:
   - Set `isValid` to false
   - Print "Please enter a valid email address"
   - Return

## Function: ValidateForm
1. Call `ValidateUsername`
2. Call `ValidatePassword`
3. Call `ValidateEmail`

4. If `isValid` is true:
   - Print "Form is valid"
   - Proceed with form submission
5. Else:
   - Print "Form has errors, please fix them"

## End