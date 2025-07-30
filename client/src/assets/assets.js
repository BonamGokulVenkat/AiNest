import { Eraser, FileSearch, Hash, ImageOff, Sparkles, SquarePen } from "lucide-react";

export const AiToolsData = [
  {
    title: 'AI Article Writer',
    description: 'Generate high-quality, engaging articles on any topic with our AI writing technology.',
    Icon: SquarePen,
    bg: { from: '#3588F2', to: '#0BBBD7' },
    path: '/ai/write-article'
  },
  {
    title: 'Resume Reviewer',
    description: 'Get instant, smart suggestions to improve your resume and boost your chances.',
    Icon: FileSearch,
    bg: { from: '#4E6EFD', to: '#48C6EF' },
    path: '/ai/review-resume'
  },
  {
    title: 'Object Remover',
    description: 'Remove unwanted objects from images seamlessly with advanced AI tools.',
    Icon: Eraser,
    bg: { from: '#EF476F', to: '#FFD166' },
    path: '/ai/remove-object'
  },
  {
    title: 'Background Remover',
    description: 'Erase backgrounds from photos instantly and cleanly with AI precision.',
    Icon: ImageOff,
    bg: { from: '#8338EC', to: '#FF006E' },
    path: '/ai/remove-background'
  },
  {
    title: 'AI Image Generator',
    description: 'Turn your imagination into reality by generating images using text prompts.',
    Icon: Sparkles,
    bg: { from: '#06D6A0', to: '#1B9AAA' },
    path: '/ai/generate-images'
  },
  {
    title: 'Blog Title Generator',
    description: 'Find the perfect, catchy title for your blog posts with our AI-powered generator.',
    Icon: Hash,
    bg: { from: '#F15BB5', to: '#9B5DE5' },
    path: '/ai/blog-titles'
  }
]
