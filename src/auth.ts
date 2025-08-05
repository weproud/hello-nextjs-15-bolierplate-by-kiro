import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import { Envs } from './lib/env'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: Envs.AUTH_GOOGLE_ID,
      clientSecret: Envs.AUTH_GOOGLE_SECRET,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          lastLoginAt: new Date(),
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    session({ session, token }) {
      if (token.id) {
        session.user.id = token.id
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  trustHost: true,
  secret: Envs.AUTH_SECRET,
})
