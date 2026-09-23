import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, FolderTree } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { MainLayout } from '@/layouts/MainLayout'

export default function CategoryForm() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isDefault: false,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert('Hardware category created successfully.')
    navigate('/categories')
  }

  return (
    <MainLayout pageTitle="Add Hardware Category">
      <div className="max-w-2xl mx-auto space-y-6 text-slate-100">
        <div className="flex items-center gap-3">
          <Link to="/categories">
            <Button variant="outline" size="sm" className="text-xs gap-1 border-slate-700">
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </Button>
          </Link>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Create Asset Category</h2>
            <p className="text-xs text-slate-400 mt-0.5">Define new hardware classification group.</p>
          </div>
        </div>

        <Card className="p-6 bg-slate-900 border-slate-800 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Category Name *"
              placeholder="e.g. Telecommunications & VoIP"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              label="Description"
              placeholder="Detailed description of hardware types covered by this category"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
              <Link to="/categories">
                <Button variant="outline" size="sm" className="text-xs border-slate-700">Cancel</Button>
              </Link>
              <Button type="submit" size="sm" className="text-xs gap-1.5 bg-blue-600 hover:bg-blue-500 text-white">
                <CheckCircle2 className="w-4 h-4" /> Save Category
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </MainLayout>
  )
}
