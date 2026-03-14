import { useMemo, useState } from 'react'
import Filterbar from './Filterbar'
import Programcard from './Programcard'
import Programdetails from './Programdetails'

const MASTER_DELETE_CODE = 'DOLLENTE2026'

function Programlist({ programs, onSaveProgram, onDeleteProgram }) {
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [selectedProgramId, setSelectedProgramId] = useState(null)
  const [modalState, setModalState] = useState({ open: false, mode: 'add', program: null })

  const statusOptions = useMemo(
    () => [
      { value: 'all', label: 'All Status' },
      { value: 'Active', label: 'Active' },
      { value: 'Inactive', label: 'Inactive' },
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

  const departmentOptions = useMemo(
    () => [
      { value: 'all', label: 'All Departments' },
      ...Array.from(new Set(programs.map((program) => program.department).filter(Boolean))).map((department) => ({
        value: department,
        label: department,
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
      const matchesDepartment = departmentFilter === 'all' || program.department === departmentFilter

      return matchesQuery && matchesStatus && matchesType && matchesDepartment
    })
  }, [programs, query, statusFilter, typeFilter, departmentFilter])

  const groupedPrograms = useMemo(() => {
    return filteredPrograms.reduce((accumulator, program) => {
      const department = program.department || 'Unassigned Department'
      if (!accumulator[department]) {
        accumulator[department] = []
      }
      accumulator[department].push(program)
      return accumulator
    }, {})
  }, [filteredPrograms])

  const selectedProgram = useMemo(
    () => programs.find((program) => program.id === selectedProgramId) || null,
    [programs, selectedProgramId],
  )

  const initialForm = (program) => ({
    code: program?.code || '',
    name: program?.name || '',
    department: program?.department || '',
    type: program?.type || "Bachelor's",
    duration: program?.duration || '4 Years',
    totalUnits: program?.totalUnits || 0,
    status: program?.status || 'Active',
    description: program?.description || '',
  })

  const [formData, setFormData] = useState(initialForm(null))

  const courseDepartmentOptions = useMemo(() => {
    const values = new Set(programs.map((program) => program.department).filter(Boolean))
    if (formData.department) {
      values.add(formData.department)
    }
    return Array.from(values).sort()
  }, [programs, formData.department])

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

  const handleDeleteProgram = async (program) => {
    const masterCode = window.prompt('Enter master code to delete this course:')
    if (masterCode !== MASTER_DELETE_CODE) {
      window.alert('Invalid master code. Delete action cancelled.')
      return
    }

    const shouldDelete = window.confirm(`Delete course ${program.code}?`)
    if (!shouldDelete) {
      return
    }

    try {
      await onDeleteProgram(program.id)
      setSelectedProgramId((previous) => (previous === program.id ? null : previous))
    } catch (error) {
      window.alert(error?.message || 'Unable to delete course. Please try again.')
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (modalState.mode === 'edit') {
      const shouldProceed = window.confirm('Proceed with saving changes to this course?')
      if (!shouldProceed) {
        return
      }
    }

    const programPayload = {
      ...modalState.program,
      id: modalState.program?.id,
      code: formData.code.toUpperCase(),
      name: formData.name,
      department: formData.department,
      type: formData.type,
      duration: formData.duration,
      totalUnits: Number(formData.totalUnits),
      status: formData.status,
      description: formData.description,
      createdAt: modalState.program?.createdAt || new Date().toISOString().slice(0, 10),
    }

    try {
      await onSaveProgram(programPayload)
      closeModal()
    } catch (error) {
      window.alert(error?.message || 'Unable to save course changes. Please try again.')
    }
  }

  return (
    <section className="module-stack">
      <Filterbar
        searchPlaceholder="Search by course code or name"
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
            label: 'Course Type',
            value: typeFilter,
            onChange: setTypeFilter,
            options: typeOptions,
          },
          {
            key: 'department',
            label: 'Department',
            value: departmentFilter,
            onChange: setDepartmentFilter,
            options: departmentOptions,
          },
        ]}
        actionButton={
          <button type="button" className="module-primary-btn" onClick={openAddModal}>
            Add Course
          </button>
        }
      />

      <div className="module-meta-row panel">
        <p>
          Showing <strong>{filteredPrograms.length}</strong> of <strong>{programs.length}</strong>{' '}
          courses
        </p>
      </div>

      {filteredPrograms.length ? (
        Object.entries(groupedPrograms)
          .sort(([left], [right]) => left.localeCompare(right))
          .map(([department, departmentPrograms]) => (
            <section key={department} className="module-stack" aria-label={`${department} department courses`}>
              <div className="module-meta-row panel">
                <p>
                  <strong>{department}</strong> Department · <strong>{departmentPrograms.length}</strong>{' '}
                  course(s)
                </p>
              </div>
              <div className="module-grid">
                {departmentPrograms.map((program) => (
                  <Programcard key={program.id} program={program} onSelect={(item) => setSelectedProgramId(item.id)} />
                ))}
              </div>
            </section>
          ))
      ) : (
        <article className="panel module-empty-state">
          <h3>No courses found</h3>
          <p>Try adjusting your search text or selected filters.</p>
        </article>
      )}

      {selectedProgram ? (
        <div className="modal-backdrop" role="presentation" onClick={() => setSelectedProgramId(null)}>
          <div
            className="modal-card detail-modal panel"
            role="dialog"
            aria-modal="true"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-actions modal-actions-top">
              <button type="button" onClick={() => setSelectedProgramId(null)}>
                Close
              </button>
            </div>
            <Programdetails
              program={selectedProgram}
              onEdit={(program) => {
                setSelectedProgramId(null)
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
              <h3>{modalState.mode === 'add' ? 'Add Course' : 'Edit Course'}</h3>
             
            </div>
            <form className="module-form module-form-grid" onSubmit={handleSubmit}>
              <label>
                Course Code
                <input
                  value={formData.code}
                  onChange={(event) => setFormData((prev) => ({ ...prev, code: event.target.value }))}
                  required
                />
              </label>
              <label className="form-span-2">
                Course Name
                <input
                  value={formData.name}
                  onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
                  required
                />
              </label>
              <label>
                Department
                <select
                  value={formData.department}
                  onChange={(event) => setFormData((prev) => ({ ...prev, department: event.target.value }))}
                  required
                >
                  <option value="">Select department</option>
                  {courseDepartmentOptions.map((department) => (
                    <option key={department} value={department}>
                      {department}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Course Type
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
                  <option value="Inactive">Inactive</option>
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