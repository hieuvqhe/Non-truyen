import { Link } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'
import path from '../../constants/path'

const Footer = () => {
  return (
    <footer className='border-t bg-background py-6 md:py-10'>
      <div className='container flex flex-col items-center justify-between gap-4 px-4 md:flex-row md:px-6'>
        <div className='flex flex-col items-center gap-4 md:items-start'>
          <Link to={path.home} className='flex items-center space-x-2'>
            <AlertCircle className='h-6 w-6 text-primary' />
            <span className='font-bold'>NON TRUYỆN</span>
          </Link>
          <p className='text-center text-sm text-muted-foreground md:text-left'>
            © {new Date().getFullYear()} NONTRUYEN. All rights reserved.
          </p>
        </div>

        <div className='flex flex-wrap justify-center gap-x-8 gap-y-4 md:justify-end'>
          <Link to={path.feedback} className='text-sm hover:underline'>
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  )
}

export default Footer
