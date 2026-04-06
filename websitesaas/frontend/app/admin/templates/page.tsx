'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Modal } from '@/components/ui/modal'
import {
  Search,
  LayoutTemplate,
  Plus,
  Edit,
  Trash2,
  Eye,
  Copy,
  Tag,
} from 'lucide-react'

interface Template {
  id: string
  name: string
  category: string
  status: 'published' | 'draft' | 'archived'
  usageCount: number
  createdBy: string
  createdAt: string
  thumbnail: string
}

const mockTemplates: Template[] = [
  { id: '1', name: 'Business Starter', category: 'Business', status: 'published', usageCount: 142, createdBy: 'Admin', createdAt: '2024-01-10', thumbnail: 'business' },
  { id: '2', name: 'Portfolio Minimal', category: 'Portfolio', status: 'published', usageCount: 89, createdBy: 'Admin', createdAt: '2024-02-15', thumbnail: 'portfolio' },
  { id: '3', name: 'E-commerce Pro', category: 'E-commerce', status: 'published', usageCount: 67, createdBy: 'Admin', createdAt: '2024-03-20', thumbnail: 'ecommerce' },
  { id: '4', name: 'Blog Classic', category: 'Blog', status: 'draft', usageCount: 0, createdBy: 'Admin', createdAt: '2024-04-05', thumbnail: 'blog' },
  { id: '5', name: 'Restaurant Menu', category: 'Restaurant', status: 'published', usageCount: 34, createdBy: 'Admin', createdAt: '2024-05-12', thumbnail: 'restaurant' },
  { id: '6', name: 'Agency Dark', category: 'Agency', status: 'archived', usageCount: 28, createdBy: 'Admin', createdAt: '2024-01-25', thumbnail: 'agency' },
  { id: '7', name: 'SaaS Landing', category: 'SaaS', status: 'published', usageCount: 156, createdBy: 'Admin', createdAt: '2024-06-18', thumbnail: 'saas' },
  { id: '8', name: 'Event Landing', category: 'Event', status: 'draft', usageCount: 0, createdBy: 'Admin', createdAt: '2024-07-22', thumbnail: 'event' },
]

const categories = ['All', 'Business', 'Portfolio', 'E-commerce', 'Blog', 'Restaurant', 'Agency', 'SaaS', 'Event']

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>(mockTemplates)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newTemplateName, setNewTemplateName] = useState('')
  const [newTemplateCategory, setNewTemplateCategory] = useState('Business')

  const filtered = templates.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = categoryFilter === 'All' || t.category === categoryFilter
    const matchesStatus = !statusFilter || t.status === statusFilter
    return matchesSearch && matchesCategory && matchesStatus
  })

  const handleCreate = () => {
    if (!newTemplateName.trim()) return
    const newTemplate: Template = {
      id: String(templates.length + 1),
      name: newTemplateName.trim(),
      category: newTemplateCategory,
      status: 'draft',
      usageCount: 0,
      createdBy: 'Admin',
      createdAt: new Date().toISOString().split('T')[0],
      thumbnail: 'default',
    }
    setTemplates((prev) => [...prev, newTemplate])
    setNewTemplateName('')
    setShowCreateModal(false)
  }

  const handleDelete = (id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id))
  }

  const handleDuplicate = (template: Template) => {
    const duplicate: Template = {
      ...template,
      id: String(templates.length + 1),
      name: `${template.name} (Copy)`,
      status: 'draft',
      usageCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
    }
    setTemplates((prev) => [...prev, duplicate])
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Template Management</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Create, edit, and manage website templates
          </p>
        </div>
        <Button variant="primary" size="md" onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Template
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input
                placeholder="Search templates..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              options={categories.map((c) => ({ value: c, label: c }))}
            />
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'published', label: 'Published' },
                { value: 'draft', label: 'Draft' },
                { value: 'archived', label: 'Archived' },
              ]}
            />
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((template) => (
          <Card key={template.id} className="hover:shadow-md transition-shadow overflow-hidden">
            <div className="h-32 bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 flex items-center justify-center">
              <LayoutTemplate className="h-10 w-10 text-zinc-400 dark:text-zinc-600" />
            </div>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-sm truncate">{template.name}</CardTitle>
                  <CardDescription className="flex items-center gap-1 mt-1">
                    <Tag className="h-3 w-3" />
                    {template.category}
                  </CardDescription>
                </div>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  template.status === 'published'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : template.status === 'draft'
                    ? 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {template.status}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-3">
                <span>{template.usageCount} uses</span>
                <span>{template.createdAt}</span>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" className="flex-1">
                  <Eye className="h-3 w-3 mr-1" />
                  Preview
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDuplicate(template)}>
                  <Copy className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Edit className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(template.id)} className="text-red-600">
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-zinc-500 dark:text-zinc-400">
          No templates found matching your filters
        </div>
      )}

      {/* Create Modal */}
      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)}>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
          Create New Template
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Template Name</label>
            <Input
              value={newTemplateName}
              onChange={(e) => setNewTemplateName(e.target.value)}
              placeholder="Enter template name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Category</label>
            <Select
              value={newTemplateCategory}
              onChange={(e) => setNewTemplateCategory(e.target.value)}
              options={categories.filter((c) => c !== 'All').map((c) => ({ value: c, label: c }))}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleCreate} disabled={!newTemplateName.trim()}>Create</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
