import type { BetterAuthPlugin } from "better-auth";
import { APIError } from "better-auth/api";
import { FREE_EMAIL_DOMAINS } from "./free-domains";

export { FREE_EMAIL_DOMAINS } from "./free-domains";

export interface BlockFreeEmailsOptions {
    /**
     * List of email domains to block
     * @default FREE_EMAIL_DOMAINS
     */
    blockedDomains?: string[];

    /**
     * List of email domains to allow (allowlist mode)
     * If set, only these domains will be allowed
     */
    allowedDomains?: string[];

    /**
     * Custom error message to show users
     */
    customErrorMessage?: string;

    /**
     * Whether to also block on sign-in
     * @default true
     */
    blockOnSignIn?: boolean;

    /**
     * Custom validation function for advanced use cases
     * Return true to allow, false to block
     */
    customValidator?: (email: string, domain: string) => boolean | Promise<boolean>;
}

/**
 * Better Auth plugin to block free email addresses during sign-up
 * 
 * @example
 * ```ts
 * import { blockFreeEmails } from "@your-workspace/better-auth-block-free-emails";
 * 
 * export const auth = betterAuth({
 *   plugins: [
 *     blockFreeEmails({
 *       customErrorMessage: "Please use your work email"
 *     })
 *   ]
 * });
 * ```
 */
export const blockFreeEmails = (
    options: BlockFreeEmailsOptions = {}
): BetterAuthPlugin => {
    const {
        blockedDomains = FREE_EMAIL_DOMAINS as unknown as string[],
        allowedDomains = [],
        customErrorMessage = "Please use your corporate email address. Free email providers are not allowed.",
        blockOnSignIn = true,
        customValidator,
    } = options;

    return {
        id: "block-free-emails",
        hooks: {
            before: [
                {
                    matcher: (context) => {
                        const paths = ["/sign-in/magic-link"];
                        return paths.includes(context.path);
                    },
                    handler: async (context) => {
                        // @ts-ignore
                        const email = context.body?.email as string;
                        console.log("checking ...", email)

                        if (!email) {
                            return context;
                        }

                        const domain = email.split("@")[1]?.toLowerCase();

                        if (!domain) {
                            throw new APIError("BAD_REQUEST", {
                                message: "Invalid email address format.",
                            });
                        }

                        // Custom validator takes precedence
                        if (customValidator) {
                            const isAllowed = await customValidator(email, domain);
                            if (!isAllowed) {
                                throw new APIError("BAD_REQUEST", {
                                    message: customErrorMessage,
                                });
                            }
                            return context;
                        }

                        // Allowlist mode - only allow specific domains
                        if (allowedDomains.length > 0) {
                            if (!allowedDomains.includes(domain)) {
                                throw new APIError("BAD_REQUEST", {
                                    message: customErrorMessage,
                                });
                            }
                            return context;
                        }

                        // Blocklist mode - block specific domains
                        if (blockedDomains.includes(domain)) {
                            throw new APIError("BAD_REQUEST", {
                                message: customErrorMessage,
                            });
                        }

                        return context;
                    },
                },
            ],
        },
    };
};

/**
 * Helper function to check if an email domain is a free provider
 */
export const isFreeEmailDomain = (email: string): boolean => {
    const domain = email.split("@")[1]?.toLowerCase();
    return FREE_EMAIL_DOMAINS.includes(domain as any);
};
