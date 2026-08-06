import { useNavigate } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { FileQuestion, Home, BookOpen } from 'lucide-react'

export const NotFound = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 font-sans animate-fadeIn">
      <Card className="max-w-md w-full p-10 border border-border text-center flex flex-col items-center gap-5">
        <div className="p-5 bg-accent/10 text-accent rounded-full border border-accent/20">
          <FileQuestion className="w-12 h-12" />
        </div>

        <div>
          <span className="text-[10px] font-bold text-accent uppercase tracking-widest block mb-1">
            Error 404
          </span>
          <h1 className="text-3xl font-serif font-bold text-text">Page Not Found</h1>
          <p className="text-xs text-text-muted mt-2 leading-relaxed">
            The manuscript or page you are looking for has been moved, renamed, or lost in the
            archives.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full border-t border-border/50 pt-5 mt-1">
          <Button
            onClick={() => navigate('/')}
            className="text-xs py-2 px-4 flex items-center justify-center gap-2 cursor-pointer w-full"
          >
            <Home className="w-4 h-4" /> Return to Home
          </Button>

          <Button
            onClick={() => navigate('/library')}
            variant="outline"
            className="text-xs py-2 px-4 flex items-center justify-center gap-2 cursor-pointer w-full"
          >
            <BookOpen className="w-4 h-4" /> Browse Library
          </Button>
        </div>
      </Card>
    </div>
  )
}
