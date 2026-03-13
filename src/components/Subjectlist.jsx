import { useMemo, useState } from 'react'
import Filterbar from './Filterbar'
import Subjectcard from './Subjectcard'
import Subjectdetails from './Subjectdetails'

const MASTER_DELETE_CODE = 'DOLLENTE2026'

const YEAR_LEVEL_OPTIONS = ['1st Year', '2nd Year', '3rd Year', '4th Year']

const inferYearLevelFromCode = (subjectCode = '') => {
  const match = String(subjectCode).toUpperCase().match(/(\d)/)
  if (!match) {
    return '1st Year'
  }

  const yearDigit = Number(match[1])
  if (yearDigit <= 1) {
    return '1st Year'
  }
  if (yearDigit === 2) {
    return '2nd Year'
  }
  if (yearDigit === 3) {
    return '3rd Year'
  }

  return '4th Year'
}

function Subjectlist({ subjects, programs, onSaveSubject, onDeleteSubject }) {
  const [query, setQuery] = useState('')
  const [semesterFilter, setSemesterFilter] = useState('all')
  const [yearLevelFilter, setYearLevelFilter] = useState('all')
  const [unitsFilter, setUnitsFilter] = useState('all')
  const [preReqFilter, setPreReqFilter] = useState('all')
  const [programFilter, setProgramFilter] = useState('all')
  const [selectedSubject, setSelectedSubject] = useState(null)
  const [modalState, setModalState] = useState({ open: false, mode: 'add', subject: null })
  const [preReqSelection, setPreReqSelection] = useState('')

  const initialForm = (subject = null) => ({
    code: subject?.code || '',
    title: subject?.title || '',
    units: subject?.units || 3,
    yearLevel: subject?.yearLevel || inferYearLevelFromCode(subject?.code),
    offeredIn: subject?.offeredIn || '1st Semester',
    termIndicator: subject?.termIndicator || 'Per Semester',
    programCode: subject?.programCode || programs[0]?.code || '',
    description: subject?.description || '',
    prerequisites: subject?.prerequisites || [],
  })

  const [formData, setFormData] = useState(initialForm())

  const openAddModal = () => {
    setFormData(initialForm())
    setPreReqSelection('')
    setModalState({ open: true, mode: 'add', subject: null })
  }

  const openEditModal = (subject) => {
    setFormData(initialForm(subject))
    setPreReqSelection('')
    setModalState({ open: true, mode: 'edit', subject })
  }

  const closeModal = () => {
    setPreReqSelection('')
    setModalState({ open: false, mode: 'add', subject: null })
  }

  const selectableSubjectCodes = useMemo(() => {
    return subjects
      .filter((subject) => {
        const matchesProgram = subject.programCode === formData.programCode
        const isCurrentSubject = modalState.subject?.id && subject.id === modalState.subject.id
        return matchesProgram && !isCurrentSubject
      })
      .sort((a, b) => a.code.localeCompare(b.code))
  }, [subjects, formData.programCode, modalState.subject])

  const addRequisiteCode = (field, code) => {
    if (!code) {
      return
    }

    setFormData((previous) => {
      if (previous[field].includes(code)) {
        return previous
      }

      return {
        ...previous,
        [field]: [...previous[field], code],
      }
    })
  }

  const removeRequisiteCode = (field, code) => {
    setFormData((previous) => ({
      ...previous,
      [field]: previous[field].filter((item) => item !== code),
    }))
  }

  const handleDeleteSubject = (subject) => {
    const masterCode = window.prompt('Enter master code to delete this subject:')
    if (masterCode !== MASTER_DELETE_CODE) {
      window.alert('Invalid master code. Delete action cancelled.')
      return
    }

    const shouldDelete = window.confirm(`Delete subject ${subject.code}?`)
    if (!shouldDelete) {
      return
    }

    onDeleteSubject(subject.id)
    setSelectedSubject((previous) => (previous?.id === subject.id ? null : previous))
  }

  const semesterOptions = useMemo(
    () => [
      { value: 'all', label: 'All Semester/Term' },
      ...Array.from(new Set(subjects.map((subject) => subject.offeredIn))).map((value) => ({
        value,
        label: value,
      })),
    ],
    [subjects],
  )

  const unitsOptions = useMemo(
    () => [
      { value: 'all', label: 'All Units' },
      ...Array.from(new Set(subjects.map((subject) => String(subject.units)))).map((value) => ({
        value,
        label: `${value} Units`,
      })),
    ],
    [subjects],
  )

  const yearLevelOptions = useMemo(
    () => [
      { value: 'all', label: 'All Year Levels' },
      ...Array.from(
        new Set(subjects.map((subject) => subject.yearLevel || inferYearLevelFromCode(subject.code))),
      ).map((value) => ({ value, label: value })),
    ],
    [subjects],
  )

  const programOptions = useMemo(
    () => [
      { value: 'all', label: 'All Programs' },
      ...programs.map((program) => ({ value: program.code, label: program.code })),
    ],
    [programs],
  )

  const filteredSubjects = useMemo(() => {
    return subjects.filter((subject) => {
      const matchesQuery =
        subject.code.toLowerCase().includes(query.toLowerCase()) ||
        subject.title.toLowerCase().includes(query.toLowerCase())

      const matchesSemester = semesterFilter === 'all' || subject.offeredIn === semesterFilter
      const subjectYearLevel = subject.yearLevel || inferYearLevelFromCode(subject.code)
      const matchesYearLevel = yearLevelFilter === 'all' || subjectYearLevel === yearLevelFilter
      const matchesUnits = unitsFilter === 'all' || String(subject.units) === unitsFilter
      const matchesProgram = programFilter === 'all' || subject.programCode === programFilter
      const hasPrerequisite = subject.prerequisites.length > 0
      const matchesPrerequisite =
        preReqFilter === 'all' ||
        (preReqFilter === 'with' && hasPrerequisite) ||
        (preReqFilter === 'without' && !hasPrerequisite)

      return (
        matchesQuery &&
        matchesSemester &&
        matchesYearLevel &&
        matchesUnits &&
        matchesProgram &&
        matchesPrerequisite
      )
    })
  }, [subjects, query, semesterFilter, yearLevelFilter, unitsFilter, preReqFilter, programFilter])

  const handleSubmit = (event) => {
    event.preventDefault()

    const shouldProceed = window.confirm(
      modalState.mode === 'edit'
        ? 'Proceed with saving changes to this subject?'
        : 'Proceed with adding this subject?',
    )
    if (!shouldProceed) {
      return
    }

    const subjectPayload = {
      ...modalState.subject,
      id: modalState.subject?.id || `s-${Date.now()}`,
      code: formData.code.toUpperCase(),
      title: formData.title,
      units: Number(formData.units),
      yearLevel: formData.yearLevel,
      offeredIn: formData.offeredIn,
      termIndicator: formData.termIndicator,
      programCode: formData.programCode,
      description: formData.description,
      prerequisites: formData.prerequisites,
      createdAt: modalState.subject?.createdAt || new Date().toISOString().slice(0, 10),
    }

    onSaveSubject(subjectPayload)
    closeModal()
  }

  return (
    <section className="module-stack">
      <Filterbar
        searchPlaceholder="Search by subject code or title"
        searchValue={query}
        onSearchChange={setQuery}
        filters={[
          {
            key: 'semester',
            label: 'Semester/Term',
            value: semesterFilter,
            onChange: setSemesterFilter,
            options: semesterOptions,
          },
          {
            key: 'units',
            label: 'Units',
            value: unitsFilter,
            onChange: setUnitsFilter,
            options: unitsOptions,
          },
          {
            key: 'yearLevel',
            label: 'Year Level',
            value: yearLevelFilter,
            onChange: setYearLevelFilter,
            options: yearLevelOptions,
          },
          {
            key: 'prerequisites',
            label: 'Pre-requisites',
            value: preReqFilter,
            onChange: setPreReqFilter,
            options: [
              { value: 'all', label: 'All' },
              { value: 'with', label: 'With Pre-requisites' },
              { value: 'without', label: 'Without Pre-requisites' },
            ],
          },
          {
            key: 'program',
            label: 'Program',
            value: programFilter,
            onChange: setProgramFilter,
            options: programOptions,
          },
        ]}
        actionButton={
          <button type="button" className="module-primary-btn" onClick={openAddModal}>
            Add Subject
          </button>
        }
      />

      <div className="module-meta-row panel">
        <p>
          Showing <strong>{filteredSubjects.length}</strong> of <strong>{subjects.length}</strong>{' '}
          subjects
        </p>
      </div>

      <div className="module-grid">
        {filteredSubjects.length ? (
          filteredSubjects.map((subject) => (
            <Subjectcard key={subject.id} subject={subject} onSelect={setSelectedSubject} />
          ))
        ) : (
          <article className="panel module-empty-state">
            <h3>No subjects found</h3>
          </article>
        )}
      </div>

      {selectedSubject ? (
        <div className="modal-backdrop" role="presentation" onClick={() => setSelectedSubject(null)}>
          <div
            className="modal-card detail-modal panel"
            role="dialog"
            aria-modal="true"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-actions modal-actions-top">
              <button type="button" onClick={() => setSelectedSubject(null)}>
                Close
              </button>
            </div>
            <Subjectdetails
              subject={selectedSubject}
              onEdit={(subject) => {
                setSelectedSubject(null)
                openEditModal(subject)
              }}
              onDelete={handleDeleteSubject}
            />
          </div>
        </div>
      ) : null}

      {modalState.open ? (
        <div className="modal-backdrop" role="presentation">
          <div className="modal-card panel" role="dialog" aria-modal="true">
            <div className="panel-header">
              <h3>{modalState.mode === 'edit' ? 'Edit Subject' : 'Add Subject'}</h3>
            </div>

            <form className="module-form module-form-grid" onSubmit={handleSubmit}>
              <label>
                Subject Code
                <input
                  value={formData.code}
                  onChange={(event) => setFormData((prev) => ({ ...prev, code: event.target.value }))}
                  required
                />
              </label>
              <label className="form-span-2">
                Subject Title
                <input
                  value={formData.title}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, title: event.target.value }))
                  }
                  required
                />
              </label>
              <label>
                Units
                <input
                  type="number"
                  min="1"
                  value={formData.units}
                  onChange={(event) => setFormData((prev) => ({ ...prev, units: event.target.value }))}
                  required
                />
              </label>
              <label>
                Year Level
                <select
                  value={formData.yearLevel}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, yearLevel: event.target.value }))
                  }
                >
                  {YEAR_LEVEL_OPTIONS.map((yearLevel) => (
                    <option key={yearLevel} value={yearLevel}>
                      {yearLevel}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Semester/Term Offered
                <input
                  value={formData.offeredIn}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, offeredIn: event.target.value }))
                  }
                  required
                />
              </label>
              <label>
                Term Indicator
                <select
                  value={formData.termIndicator}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, termIndicator: event.target.value }))
                  }
                >
                  <option value="Per Semester">Per Semester</option>
                  <option value="Per Term">Per Term</option>
                  <option value="Both">Both</option>
                </select>
              </label>
              <label>
                Program
                <select
                  value={formData.programCode}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      programCode: event.target.value,
                      prerequisites: [],
                    }))
                  }
                  required
                >
                  {programs.map((program) => (
                    <option key={program.id} value={program.code}>
                      {program.code}
                    </option>
                  ))}
                </select>
              </label>
              <label className="form-span-2">
                Pre-requisites
                <div className="inline-picker-row">
                  <select
                    value={preReqSelection}
                    onChange={(event) => setPreReqSelection(event.target.value)}
                  >
                    <option value="">Select subject code</option>
                    {selectableSubjectCodes.map((subjectOption) => (
                      <option key={subjectOption.id} value={subjectOption.code}>
                        {subjectOption.code} - {subjectOption.title}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      addRequisiteCode('prerequisites', preReqSelection)
                      setPreReqSelection('')
                    }}
                  >
                    Add
                  </button>
                </div>
                {formData.prerequisites.length ? (
                  <div className="inline-chip-wrap">
                    {formData.prerequisites.map((code) => (
                      <button
                        key={code}
                        type="button"
                        className="inline-chip"
                        onClick={() => removeRequisiteCode('prerequisites', code)}
                        title="Remove prerequisite"
                      >
                        {code} x
                      </button>
                    ))}
                  </div>
                ) : null}
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

export default Subjectlist