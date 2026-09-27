import { useAuth, useSignUp, useSignIn, useUser } from '@clerk/expo'
import { useState, useEffect } from 'react'
import { Button, StyleSheet, Text, TextInput, View, ActivityIndicator } from 'react-native'

export default function MainScreen() {
  const { isLoaded, isSignedIn, signOut } = useAuth()
  const { signUp } = useSignUp()
  const { signIn } = useSignIn()
  const { user } = useUser()

  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [emailAddress, setEmailAddress] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Auto-finalize sign-up when status is complete
  useEffect(() => {
    if (signUp?.status === 'complete') {
      signUp.finalize().catch((err: any) => {
        console.error('Finalize sign-up error:', err)
      })
    }
  }, [signUp?.status])

  // Auto-finalize sign-in when status is complete
  useEffect(() => {
    if (signIn?.status === 'complete') {
      signIn.finalize().catch((err: any) => {
        console.error('Finalize sign-in error:', err)
      })
    }
  }, [signIn?.status])

  const handleSignUp = async () => {
    setErrorMsg('')
    setIsLoading(true)
    try {
      const { error } = await signUp.password({ emailAddress, password })
      if (error) {
        const msg = (error as any).errors?.[0]?.longMessage || error.message || 'Error signing up'
        setErrorMsg(msg)
        setIsLoading(false)
        return
      }

      const { error: sendError } = await signUp.verifications.sendEmailCode()
      if (sendError) {
        const msg = (sendError as any).errors?.[0]?.longMessage || sendError.message || 'Error sending verification code'
        setErrorMsg(msg)
        setIsLoading(false)
        return
      }

      setIsVerifying(true)
    } catch (err: any) {
      setErrorMsg(err?.message || 'Sign up failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerify = async () => {
    setErrorMsg('')
    setIsLoading(true)
    try {
      const { error } = await signUp.verifications.verifyEmailCode({ code })
      const isAlreadyVerified = (error as any)?.errors?.[0]?.code === 'verification_already_verified'

      if (error && !isAlreadyVerified) {
        const msg = (error as any).errors?.[0]?.longMessage || error.message || 'Invalid code'
        setErrorMsg(msg)
        setIsLoading(false)
        return
      }

      // If verified or already verified, finalize session
      const { error: finalizeError } = await signUp.finalize()
      if (finalizeError) {
        if (signUp.status !== 'complete') {
          const msg = (finalizeError as any).errors?.[0]?.longMessage || finalizeError.message || 'Error finalizing session'
          setErrorMsg(msg)
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Verification failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignIn = async () => {
    setErrorMsg('')
    setIsLoading(true)
    try {
      const { error } = await signIn.password({ emailAddress, password })
      if (error) {
        const msg = (error as any).errors?.[0]?.longMessage || error.message || 'Invalid email or password'
        setErrorMsg(msg)
        setIsLoading(false)
        return
      }

      const { error: finalizeError } = await signIn.finalize()
      if (finalizeError) {
        if (signIn.status !== 'complete') {
          const msg = (finalizeError as any).errors?.[0]?.longMessage || finalizeError.message || 'Sign in error'
          setErrorMsg(msg)
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Sign in failed')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isLoaded) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  if (isSignedIn) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{"You're signed in!"}</Text>
        <Text style={styles.emailText}>{user?.primaryEmailAddress?.emailAddress}</Text>
        <Button
          title="Sign out"
          color="#dc2626"
          onPress={async () => {
            await signOut()
            setEmailAddress('')
            setPassword('')
            setCode('')
            setIsVerifying(false)
            setErrorMsg('')
          }}
        />
      </View>
    )
  }

  if (isVerifying) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Verify Email</Text>
        <Text style={styles.infoText}>Enter the code sent to {emailAddress}</Text>
        {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}
        <TextInput
          style={styles.input}
          value={code}
          placeholder="Enter your verification code"
          onChangeText={setCode}
          keyboardType="numeric"
        />
        <Button
          title={isLoading ? 'Verifying...' : 'Verify'}
          disabled={isLoading || !code.trim()}
          onPress={handleVerify}
        />
        <Button
          title="← Back to Sign In"
          color="#64748b"
          onPress={() => {
            setIsVerifying(false)
            setMode('signin')
            setErrorMsg('')
          }}
        />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{mode === 'signup' ? 'Create Account' : 'Sign In'}</Text>

      {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

      <TextInput
        style={styles.input}
        autoCapitalize="none"
        value={emailAddress}
        placeholder="Enter email"
        onChangeText={setEmailAddress}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        value={password}
        placeholder="Enter password"
        secureTextEntry={true}
        onChangeText={setPassword}
      />

      <Button
        title={
          isLoading
            ? 'Please wait...'
            : mode === 'signup'
            ? 'Sign up'
            : 'Sign in'
        }
        disabled={isLoading || !emailAddress.trim() || !password.trim()}
        onPress={mode === 'signup' ? handleSignUp : handleSignIn}
      />

      <Button
        title={
          mode === 'signup'
            ? 'Already have an account? Sign In'
            : "Don't have an account? Sign Up"
        }
        color="#64748b"
        onPress={() => {
          setMode(mode === 'signup' ? 'signin' : 'signup')
          setErrorMsg('')
        }}
      />

      {/* Required for sign-up flows on Expo web. Clerk skips the browser CAPTCHA on iOS and Android */}
      <View nativeID="clerk-captcha" />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    gap: 14,
    justifyContent: 'center',
    maxWidth: 420,
    marginHorizontal: 'auto',
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  emailText: {
    fontSize: 16,
    color: '#2563eb',
    textAlign: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  errorText: {
    color: '#ef4444',
    backgroundColor: '#fee2e2',
    padding: 10,
    borderRadius: 8,
    fontSize: 14,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
})
