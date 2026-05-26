/** Canonical password-recovery and credential wording (admin-assisted; no email reset). */

export const passwordCopy = {
  /** Login help section title */
  signInHelpTitle: "Can't sign in?",
  signInHelpStep1:
    "Double-check your email and password (caps lock, typos, or a password you set recently).",
  signInHelpStep2:
    "Contact your Shyara administrator — they can issue a temporary password for your account. Passwords are not sent by email.",
  signInHelpStep3:
    "Sign in with that temporary password. You will be asked to set your own password before using the portal.",
  signInHelpSupportPrefix: "Need help? Email",

  /** User voluntary update (account menu) */
  changePassword: "Change password",
  changePasswordMenuHint: "Update the password you sign in with",

  /** First login after admin temp password */
  setYourPassword: "Set your password",
  forcedHeroTitle: "Set your password",
  forcedHeroBody:
    "Choose a personal password you have not shared with anyone. You will use it for every future sign-in.",
  forcedFormTitle: "Choose a password only you know",
  forcedFormSubtitle: "Set a new password to continue into the portal.",
  forcedBanner:
    "Your administrator gave you a temporary password. Replace it with your own before continuing.",
  forcedSubmit: "Save and continue",
  forcedSuccessToast: "Password saved. You can use the portal now.",

  /** Voluntary change-password page */
  voluntaryHeroTitle: "Update your password",
  voluntaryHeroBody: "Pick a strong password you do not use elsewhere.",
  voluntaryFormTitle: "Change password",
  voluntaryFormSubtitle: "Enter your current password, then choose a new one.",
  voluntarySubmit: "Save password",
  voluntarySuccessToast: "Password updated.",

  savePasswordPending: "Saving…",
  currentPasswordIncorrect: "Current password is incorrect.",

  /** Admin users */
  mustSetNewPasswordColumn: "Must set new password",
  mustSetNewPasswordYes: "Yes",
  mustSetNewPasswordNo: "No",
  issueTemporaryPassword: "Issue temporary password",
  issueTemporaryPasswordTitle: "Issue temporary password",
  issueTemporaryPasswordDescription:
    "The user signs in with this temporary password, then must set their own password before using the portal.",
  issueTemporaryPasswordFieldLabel: "Temporary password (optional)",
  issueTemporaryPasswordFieldHint: "Leave empty to generate a secure temporary password.",
  issueTemporaryPasswordSubmit: "Issue password",
  issueTemporaryPasswordSuccessToast:
    "Temporary password issued. User must set a new password at next sign-in.",

  temporaryPasswordDialogTitle: "Temporary password",
  temporaryPasswordDialogDescription:
    "Share this password once. The user must set a new password at first sign-in.",
  temporaryPasswordCopy: "Copy",
  temporaryPasswordCopiedToast: "Copied to clipboard",
  temporaryPasswordDone: "Done",

  createUserPasswordLabel: "Password (optional — generated if empty)",
  createUserMustChangeHint:
    "Require password change on first login (only when you set a password above). Empty password always requires a change at first sign-in.",
  createUserGeneratedToast: (roleLabel: string) =>
    `${roleLabel} created. Share the temporary password — they must set a new password at first sign-in.`,
  createUserExplicitToast: (roleLabel: string) =>
    `${roleLabel} created. They can sign in with the password you set.`
} as const;

export function portalSupportEmail(): string | null {
  const raw = (import.meta.env.VITE_PORTAL_SUPPORT_EMAIL as string | undefined)?.trim();
  return raw && raw.includes("@") ? raw : null;
}
