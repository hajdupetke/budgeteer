const getErrorMessage = (error: string): string => {
  switch (error) {
    case 'OAuthSignin':
      return 'An error occurred while trying to sign in with the provider.';
    case 'OAuthCallback':
      return 'An error occurred while processing the sign in callback.';
    case 'OAuthCreateAccount':
      return 'There was a problem creating your account with the provider.';
    case 'EmailCreateAccount':
      return 'There was a problem creating your account with the email provider.';
    case 'Callback':
      return 'There was a problem with the sign in callback.';
    case 'OAuthAccountNotLinked':
      return 'The email on your social account is already associated with another account.';
    case 'EmailSignin':
      return 'There was a problem sending the sign in email.';
    case 'CredentialsSignin':
      return 'The sign in credentials were incorrect.';
    case 'SessionRequired':
      return 'You must be signed in to access this page.';
    default:
      return 'An unknown error occurred during sign in.';
  }
};
const LoginError = ({ errorType }: { errorType: string }) => {
  return (
    <p className="w-full border p-4 mt-2 border-red-800 bg-red-200 text-wrap">
      {getErrorMessage(errorType)}
    </p>
  );
};

export default LoginError;
