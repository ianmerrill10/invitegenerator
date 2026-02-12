// ============================================
// AWS COGNITO SERVICE
// Authentication operations
// ============================================

import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  SignUpCommand,
  ConfirmSignUpCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
  GetUserCommand,
  GlobalSignOutCommand,
  ResendConfirmationCodeCommand,
  ChangePasswordCommand,
  UpdateUserAttributesCommand,
} from '@aws-sdk/client-cognito-identity-provider';

const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION || 'us-east-1',
});

const USER_POOL_ID = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || '';
const CLIENT_ID = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || '';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  idToken: string;
  expiresIn: number;
}

export interface AuthResult {
  success: boolean;
  tokens?: AuthTokens;
  user?: CognitoUser;
  error?: string;
  errorCode?: string;
}

export interface CognitoUser {
  sub: string;
  email: string;
  emailVerified: boolean;
  name?: string;
}

/**
 * Sign up a new user
 */
export async function signUp(
  email: string,
  password: string,
  name: string
): Promise<AuthResult> {
  try {
    const command = new SignUpCommand({
      ClientId: CLIENT_ID,
      Username: email,
      Password: password,
      UserAttributes: [
        { Name: 'email', Value: email },
        { Name: 'name', Value: name },
      ],
    });

    await cognitoClient.send(command);

    return {
      success: true,
    };
  } catch (error: unknown) {
    const cognitoError = error as { name?: string; message?: string };
    console.error('Cognito signUp error:', error);
    return {
      success: false,
      error: cognitoError.message || 'Sign up failed',
      errorCode: cognitoError.name,
    };
  }
}

/**
 * Confirm sign up with verification code
 */
export async function confirmSignUp(
  email: string,
  code: string
): Promise<AuthResult> {
  try {
    const command = new ConfirmSignUpCommand({
      ClientId: CLIENT_ID,
      Username: email,
      ConfirmationCode: code,
    });

    await cognitoClient.send(command);

    return { success: true };
  } catch (error: unknown) {
    const cognitoError = error as { name?: string; message?: string };
    console.error('Cognito confirmSignUp error:', error);
    return {
      success: false,
      error: cognitoError.message || 'Confirmation failed',
      errorCode: cognitoError.name,
    };
  }
}

/**
 * Resend confirmation code
 */
export async function resendConfirmationCode(email: string): Promise<AuthResult> {
  try {
    const command = new ResendConfirmationCodeCommand({
      ClientId: CLIENT_ID,
      Username: email,
    });

    await cognitoClient.send(command);

    return { success: true };
  } catch (error: unknown) {
    const cognitoError = error as { name?: string; message?: string };
    console.error('Cognito resendConfirmationCode error:', error);
    return {
      success: false,
      error: cognitoError.message || 'Failed to resend code',
      errorCode: cognitoError.name,
    };
  }
}

/**
 * Sign in user
 */
export async function signIn(
  email: string,
  password: string
): Promise<AuthResult> {
  try {
    const command = new InitiateAuthCommand({
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: CLIENT_ID,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      },
    });

    const response = await cognitoClient.send(command);

    if (!response.AuthenticationResult) {
      return {
        success: false,
        error: 'Authentication failed',
      };
    }

    const tokens: AuthTokens = {
      accessToken: response.AuthenticationResult.AccessToken!,
      refreshToken: response.AuthenticationResult.RefreshToken!,
      idToken: response.AuthenticationResult.IdToken!,
      expiresIn: response.AuthenticationResult.ExpiresIn!,
    };

    // Get user info
    const user = await getUserFromToken(tokens.accessToken);

    return {
      success: true,
      tokens,
      user: user || undefined,
    };
  } catch (error: unknown) {
    const cognitoError = error as { name?: string; message?: string };
    console.error('Cognito signIn error:', error);
    return {
      success: false,
      error: cognitoError.message || 'Sign in failed',
      errorCode: cognitoError.name,
    };
  }
}

/**
 * Refresh access token
 */
export async function refreshTokens(refreshToken: string): Promise<AuthResult> {
  try {
    const command = new InitiateAuthCommand({
      AuthFlow: 'REFRESH_TOKEN_AUTH',
      ClientId: CLIENT_ID,
      AuthParameters: {
        REFRESH_TOKEN: refreshToken,
      },
    });

    const response = await cognitoClient.send(command);

    if (!response.AuthenticationResult) {
      return {
        success: false,
        error: 'Token refresh failed',
      };
    }

    const tokens: AuthTokens = {
      accessToken: response.AuthenticationResult.AccessToken!,
      refreshToken: refreshToken, // Refresh token stays the same
      idToken: response.AuthenticationResult.IdToken!,
      expiresIn: response.AuthenticationResult.ExpiresIn!,
    };

    return {
      success: true,
      tokens,
    };
  } catch (error: unknown) {
    const cognitoError = error as { name?: string; message?: string };
    console.error('Cognito refreshTokens error:', error);
    return {
      success: false,
      error: cognitoError.message || 'Token refresh failed',
      errorCode: cognitoError.name,
    };
  }
}

/**
 * Get user from access token
 */
export async function getUserFromToken(accessToken: string): Promise<CognitoUser | null> {
  try {
    const command = new GetUserCommand({
      AccessToken: accessToken,
    });

    const response = await cognitoClient.send(command);

    const attributes = response.UserAttributes || [];
    const getAttribute = (name: string) =>
      attributes.find((attr) => attr.Name === name)?.Value;

    return {
      sub: getAttribute('sub') || '',
      email: getAttribute('email') || '',
      emailVerified: getAttribute('email_verified') === 'true',
      name: getAttribute('name'),
    };
  } catch (error) {
    console.error('Cognito getUserFromToken error:', error);
    return null;
  }
}

/**
 * Sign out user
 */
export async function signOut(accessToken: string): Promise<AuthResult> {
  try {
    const command = new GlobalSignOutCommand({
      AccessToken: accessToken,
    });

    await cognitoClient.send(command);

    return { success: true };
  } catch (error: unknown) {
    const cognitoError = error as { name?: string; message?: string };
    console.error('Cognito signOut error:', error);
    return {
      success: false,
      error: cognitoError.message || 'Sign out failed',
      errorCode: cognitoError.name,
    };
  }
}

/**
 * Initiate forgot password flow
 */
export async function forgotPassword(email: string): Promise<AuthResult> {
  try {
    const command = new ForgotPasswordCommand({
      ClientId: CLIENT_ID,
      Username: email,
    });

    await cognitoClient.send(command);

    return { success: true };
  } catch (error: unknown) {
    const cognitoError = error as { name?: string; message?: string };
    console.error('Cognito forgotPassword error:', error);
    return {
      success: false,
      error: cognitoError.message || 'Failed to initiate password reset',
      errorCode: cognitoError.name,
    };
  }
}

/**
 * Confirm forgot password with code and new password
 */
export async function confirmForgotPassword(
  email: string,
  code: string,
  newPassword: string
): Promise<AuthResult> {
  try {
    const command = new ConfirmForgotPasswordCommand({
      ClientId: CLIENT_ID,
      Username: email,
      ConfirmationCode: code,
      Password: newPassword,
    });

    await cognitoClient.send(command);

    return { success: true };
  } catch (error: unknown) {
    const cognitoError = error as { name?: string; message?: string };
    console.error('Cognito confirmForgotPassword error:', error);
    return {
      success: false,
      error: cognitoError.message || 'Failed to reset password',
      errorCode: cognitoError.name,
    };
  }
}

/**
 * Change password for authenticated user
 */
export async function changePassword(
  accessToken: string,
  previousPassword: string,
  proposedPassword: string
): Promise<AuthResult> {
  try {
    const command = new ChangePasswordCommand({
      AccessToken: accessToken,
      PreviousPassword: previousPassword,
      ProposedPassword: proposedPassword,
    });

    await cognitoClient.send(command);

    return { success: true };
  } catch (error: unknown) {
    const cognitoError = error as { name?: string; message?: string };
    console.error('Cognito changePassword error:', error);
    return {
      success: false,
      error: cognitoError.message || 'Failed to change password',
      errorCode: cognitoError.name,
    };
  }
}

/**
 * Update user attributes
 */
export async function updateUserAttributes(
  accessToken: string,
  attributes: { name: string; value: string }[]
): Promise<AuthResult> {
  try {
    const command = new UpdateUserAttributesCommand({
      AccessToken: accessToken,
      UserAttributes: attributes.map((attr) => ({
        Name: attr.name,
        Value: attr.value,
      })),
    });

    await cognitoClient.send(command);

    return { success: true };
  } catch (error: unknown) {
    const cognitoError = error as { name?: string; message?: string };
    console.error('Cognito updateUserAttributes error:', error);
    return {
      success: false,
      error: cognitoError.message || 'Failed to update attributes',
      errorCode: cognitoError.name,
    };
  }
}
