export const metadata = {
  title: 'FinUnity - Glass Box Dashboard',
  description: 'Loan-evaluation decision-support tool for Cambodian smallholder farmers',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
