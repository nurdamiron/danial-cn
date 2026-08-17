/**
 * Legacy sign-in endpoint. The admin form posts to /api/auth/login like every
 * other client, so this only exists so an old bookmark or script keeps working.
 *
 * It used to accept `{ password }` with no address at all and match whichever
 * account happened to be ADMIN. That put the entire panel behind one guessable
 * string, and an attacker did not even need to know the address to try it.
 * Now it is the same handler as everyone else: address required, throttled,
 * logged.
 */
export { POST } from "@/app/api/auth/login/route";
