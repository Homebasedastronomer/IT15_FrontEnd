import { useMemo, useState } from 'react'
import Filterbar from './Filterbar'
import Programcard from './Programcard'
import Programdetails from './Programdetails'

const MASTER_DELETE_CODE = 'DOLLENTE2026'

function Programlist({ programs, onSaveProgram, onDeleteProgram }) {
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [selectedProgram, setSelectedProgram] = useState(null)
  const [modalState, setModalState] = useState({ open: false, mode: 'add', program: null })

  const statusOptions = useMemo(
    () => [
      { value: 'all', label: 'All Status' },
      { value: 'Active', label: 'Active' },
      { value: 'Phased Out', label: 'Phased Out' },
      { value: 'Under Review', label: 'Under Review' },
    ],
    [],
  )

  const typeOptions = useMemo(
    () => [
      { value: 'all', label: 'All Types' },
      ...Array.from(new Set(programs.map((program) => program.type))).map((type) => ({
        value: type,
        label: type,
      })),
    ],
    [programs],
  )

  const filteredPrograms = useMemo(() => {
    return programs.filter((program) => {
      const matchesQuery =
        program.code.toLowerCase().includes(query.toLowerCase()) ||
        program.name.toLowerCase().includes(query.toLowerCase())

      const matchesStatus = statusFilter === 'all' || program.status === statusFilter
      const matchesType = typeFilter === 'all' || program.type === typeFilter

      return matchesQuery && matchesStatus && matchesType
    })
  }, [programs, query, statusFilter, typeFilter])

  const initialForm = (program) => ({
    code: program?.code || '',
    name: program?.name || '',
    type: program?.type || "Bachelor's",
    duration: program?.duration || '4 Years',
    totalUnits: program?.totalUnits || 0,
    status: program?.status || 'Active',
    description: program?.description || '',
  })

  const [formData, setFormData] = useState(initialForm(null))

  const openAddModal = () => {
    setFormData(initialForm(null))
    setModalState({ open: true, mode: 'add', program: null })
  }

  const openEditModal = (program) => {
    setFormData(initialForm(program))
    setModalState({ open: true, mode: 'edit', program })
  }

  const closeModal = () => {
    setModalState({ open: false, mode: 'add', program: null })
  }

  const handleDeleteProgram = (program) => {
    const masterCode = window.prompt('Enter master code to delete this program:')
    if (masterCode !== MASTER_DELETE_CODE) {
      window.alert('Invalid master code. Delete action cancelled.')
      return
    }

    const shouldDelete = window.confirm(`Delete program ${program.code}?`)
    if (!shouldDelete) {
      return
    }

    onDeleteProgram(program.id)
    setSelectedProgram((previous) => (previous?.id === program.id ? null : previous))
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    if (modalState.mode === 'edit') {
      const shouldProceed = window.confirm('Proceed with saving changes to this program?')
      if (!shouldProceed) {
        return
      }
    }

    const programPayload = {
      ...modalState.program,
      id: modalState.program?.id || `p-${Date.now()}`,
      code: formData.code.toUpperCase(),
      name: formData.name,
      type: formData.type,
      duration: formData.duration,
      totalUnits: Number(formData.totalUnits),
      status: formData.status,
      description: formData.description,
      yearLevels: modalState.program?.yearLevels || {
        '1st Year': [],
        '2nd Year': [],
        '3rd Year': [],
        '4th Year': [],
      },
      createdAt: modalState.program?.createdAt || new Date().toISOString().slice(0, 10),
    }

    onSaveProgram(programPayload)
    closeModal()
  }

  return (
    <section className="module-stack">
      <Filterbar
        searchPlaceholder="Search by program code or name"
        searchValue={query}
        onSearchChange={setQuery}
        filters={[
          {
            key: 'status',
            label: 'Status',
            value: statusFilter,
            onChange: setStatusFilter,
            options: statusOptions,
          },
          {
            key: 'type',
            label: 'Program Type',
            value: typeFilter,
            onChange: setTypeFilter,
            options: typeOptions,
          },
        ]}
        actionButton={
          <button type="button" className="module-primary-btn" onClick={openAddModal}>
            Add Program
          </button>
        }
      />

      <div className="module-meta-row panel">
        <p>
          Showing <strong>{filteredPrograms.length}</strong> of <strong>{programs.length}</strong>{' '}
          programs
        </p>
      </div>

      <div className="module-grid">
        {filteredPrograms.length ? (
          filteredPrograms.map((program) => (
            <Programcard key={program.id} program={program} onSelect={setSelectedProgram} />
          ))
        ) : (
          <article className="panel module-empty-state">
            <h3>No programs found</h3>
            <p>Try adjusting your search text or selected filters.</p>
          </article>
        )}
      </div>

      {selectedProgram ? (
        <div className="modal-backdrop" role="presentation" onClick={() => setSelectedProgram(null)}>
          <div
            className="modal-card detail-modal panel"
            role="dialog"
            aria-modal="true"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-actions modal-actions-top">
              <button type="button" onClick={() => setSelectedProgram(null)}>
                Close
              </button>
            </div>
            <Programdetails
              program={selectedProgram}
              onEdit={(program) => {
                setSelectedProgram(null)
                openEditModal(program)
              }}
              onDelete={handleDeleteProgram}
            />
          </div>
        </div>
      ) : null}

      {modalState.open ? (
        <div className="modal-backdrop" role="presentation">
          <div className="modal-card panel" role="dialog" aria-modal="true">
            <div className="panel-header">
              <h3>{modalState.mode === 'add' ? 'Add Program' : 'Edit Program'}</h3>
             
            </div>
            <form className="module-form module-form-grid" onSubmit={handleSubmit}>
              <label>
                Program Code
                <input
                  value={formData.code}
                  onChange={(event) => setFormData((prev) => ({ ...prev, code: event.target.value }))}
                  required
                />
              </label>
              <label className="form-span-2">
                Program Name
                <input
                  value={formData.name}
                  onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
                  required
                />
              </label>
              <label>
                Program Type
                <input
                  value={formData.type}
                  onChange={(event) => setFormData((prev) => ({ ...prev, type: event.target.value }))}
                />
              </label>
              <label>
                Duration
                <input
                  value={formData.duration}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, duration: event.target.value }))
                  }
                />
              </label>
              <label>
                Total Units
                <input
                  type="number"
                  min="0"
                  value={formData.totalUnits}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, totalUnits: event.target.value }))
                  }
                />
              </label>
              <label>
                Status
                <select
                  value={formData.status}
                  onChange={(event) => setFormData((prev) => ({ ...prev, status: event.target.value }))}
                >
                  <option value="Active">Active</option>
                  <option value="Phased Out">Phased Out</option>
                  <option value="Under Review">Under Review</option>
                </select>
              </label>
              <label className="form-span-2">
                Description
                <textarea
                  rows="4"
                  value={formData.description}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, description: event.target.value }))
                  }
                />
              </label>
              <div className="modal-actions form-span-2">
                <button type="button" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="module-primary-btn">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  )
}

export default Programlist