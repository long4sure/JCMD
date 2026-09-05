export default function VerifyPage() {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <h1 className="text-lg font-semibold text-gray-900">
        Check your email
      </h1>
      <p className="text-sm text-gray-600">
        We&apos;ve sent a confirmation link to the email address you signed up
        with. Click the link to verify your account and get started.
      </p>
      <p className="text-sm text-gray-500">
        Didn&apos;t get it? Check your spam folder, or try signing up again in
        a few minutes.
      </p>
    </div>
  );
}
