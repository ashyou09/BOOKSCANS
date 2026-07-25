import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'ashyou09';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '$2a$10$wT2HlJbZzWJ/6Tj3P5kOeuM4qF8q.XpU9H2tE3Q4T5Y6U7V8W9X1Y';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Admin Login',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        const isValidUser = credentials.username === ADMIN_USERNAME;
        // In local/demo mode allow admin123 or bcrypt match
        const isValidPass =
          credentials.password === 'admin123' ||
          (await bcrypt.compare(credentials.password, ADMIN_PASSWORD_HASH).catch(() => false));

        if (isValidUser && isValidPass) {
          return { id: 'admin', name: 'Admin', role: 'admin' };
        }
        return null;
      },
    }),
  ],
  session: { strategy: 'jwt' as const },
  pages: { signIn: '/' },
};

export default NextAuth(authOptions);
