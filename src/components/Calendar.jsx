import React, { useEffect, useState, useMemo } from 'react'
import AddTaskModal from './AddTaskModal'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

// Simple SVG Icons as components
const CalendarIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
)

const ClockIcon = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12,6 12,12 16,14"></polyline>
  </svg>
)

const UsersIcon = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
)

const AlertIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
    <line x1="12" y1="9" x2="12" y2="13"></line>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
  </svg>
)

const ChevronLeft = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <polyline points="15,18 9,12 15,6"></polyline>
  </svg>
)

const ChevronRight = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <polyline points="9,18 15,12 9,6"></polyline>
  </svg>
)

// Sample events data as specified in the assignment
const SAMPLE_EVENTS = [
  {
    id: 1,
    title: "Team Standup",
    date: "2025-06-24",
    time: "09:00",
    duration: 30,
    type: "meeting",
    attendees: ["John", "Sarah", "Mike"]
  },
  {
    id: 2,
    title: "Project Review",
    date: "2025-06-24",
    time: "14:30",
    duration: 60,
    type: "review",
    attendees: ["Manager", "Tech Lead"]
  },
  {
    id: 3,
    title: "Client Presentation",
    date: "2025-06-25",
    time: "10:00",
    duration: 90,
    type: "presentation",
    attendees: ["Client A", "Sales Team"]
  },
  {
    id: 4,
    title: "Code Review Session",
    date: "2025-06-25",
    time: "10:30",
    duration: 45,
    type: "review",
    attendees: ["Dev Team"]
  },
  {
    id: 5,
    title: "Lunch Meeting",
    date: "2025-06-26",
    time: "12:00",
    duration: 60,
    type: "meeting",
    attendees: ["External Partner"]
  },
  {
    id: 6,
    title: "Sprint Planning",
    date: "2025-06-27",
    time: "09:00",
    duration: 120,
    type: "planning",
    attendees: ["Entire Team"]
  },
  {
    id: 7,
    title: "Design Workshop",
    date: "2025-06-30",
    time: "14:00",
    duration: 180,
    type: "workshop",
    attendees: ["Design Team", "Product Team"]
  },
  {
    id: 8,
    title: "All Hands Meeting",
    date: "2025-07-01",
    time: "15:00",
    duration: 60,
    type: "meeting",
    attendees: ["All Staff"]
  }
]

// Utility functions
const parseTime = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number)
  return hours * 60 + minutes
}

const formatTime = (timeStr) => {
  const [hours, minutes] = timeStr.split(':')
  const hour = parseInt(hours)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minutes} ${ampm}`
}

const getEventColor = (type) => {
  const colors = {
    meeting: 'bg-blue-100 text-blue-800 border-blue-200',
    review: 'bg-purple-100 text-purple-800 border-purple-200',
    presentation: 'bg-green-100 text-green-800 border-green-200',
    planning: 'bg-orange-100 text-orange-800 border-orange-200',
    workshop: 'bg-pink-100 text-pink-800 border-pink-200'
  }
  return colors[type] || 'bg-gray-100 text-gray-800 border-gray-200'
}

const detectConflicts = (events) => {
  const conflicts = []
  
  for (let i = 0; i < events.length; i++) {
    for (let j = i + 1; j < events.length; j++) {
      const event1 = events[i]
      const event2 = events[j]
      
      const start1 = parseTime(event1.time)
      const end1 = start1 + event1.duration
      const start2 = parseTime(event2.time)
      const end2 = start2 + event2.duration
      
      // Check for overlap
      if (start1 < end2 && start2 < end1) {
        conflicts.push({
          event1: event1.id,
          event2: event2.id,
          type: 'time_overlap'
        })
      }
    }
  }
  
  return conflicts
}

export default function GoogleCalendarClone() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState([])
  const [selectedDate, setSelectedDate] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleAddEvent = (event) => {
    setEvents(prevEvents => {
      const newEvents = [...prevEvents, { ...event, id: prevEvents.length + 1, attendees: [] }];
      localStorage.setItem('calendarEvents', JSON.stringify(newEvents));
      return newEvents;
    });
    setIsModalOpen(false);
  }

  // Load events from localStorage or use sample events
  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 800))
      const storedEvents = localStorage.getItem('calendarEvents')
      if (storedEvents) {
        setEvents(JSON.parse(storedEvents))
      } else {
        setEvents(SAMPLE_EVENTS)
      }
      setLoading(false)
    }

    loadEvents()
  }, [])

  // Memoized calculations
  const { year, month } = useMemo(() => ({
    year: currentDate.getFullYear(),
    month: currentDate.getMonth()
  }), [currentDate])

  const { firstDay, daysInMonth, today } = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const today = new Date()
    return { firstDay, daysInMonth, today }
  }, [year, month])

  const calendarDays = useMemo(() => {
    const days = []
    
    // Previous month's trailing days
    const prevMonth = new Date(year, month - 1, 0).getDate()
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        date: prevMonth - i,
        isCurrentMonth: false,
        isPrevMonth: true,
        fullDate: new Date(year, month - 1, prevMonth - i)
      })
    }
    
    // Current month days
    for (let date = 1; date <= daysInMonth; date++) {
      days.push({
        date,
        isCurrentMonth: true,
        isPrevMonth: false,
        fullDate: new Date(year, month, date)
      })
    }
    
    // Next month's leading days
    const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7
    const remainingCells = totalCells - days.length
    for (let date = 1; date <= remainingCells; date++) {
      days.push({
        date,
        isCurrentMonth: false,
        isPrevMonth: false,
        fullDate: new Date(year, month + 1, date)
      })
    }
    
    return days
  }, [year, month, firstDay, daysInMonth])

  const getEventsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0]
    const dayEvents = events.filter(event => event.date === dateStr)
    return dayEvents.sort((a, b) => parseTime(a.time) - parseTime(b.time))
  }

  const isToday = (date) => {
    return date.toDateString() === today.toDateString()
  }

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + direction)
      return newDate
    })
  }

  const goToToday = () => {
    setCurrentDate(new Date())
    setSelectedDate(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <div className="animate-pulse space-y-6">
              <div className="h-12 bg-gray-200 rounded-xl"></div>
              <div className="grid grid-cols-7 gap-4">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="h-8 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-4">
                {Array.from({ length: 35 }).map((_, i) => (
                  <div key={i} className="h-32 bg-gray-100 rounded-xl"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-white text-gray-800 antialiased">
      <div className="flex-1 p-2 sm:p-4 md:p-6 lg:p-8 bg-gray-50 rounded-r-xl">
        <header className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center">
            <div className="flex items-center">
              <CalendarIcon />
              <h1 className="text-xl sm:text-2xl font-bold ml-3">
                {MONTHS[month]} <span className="font-light text-gray-500">{year}</span>
              </h1>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={() => navigateMonth(-1)} className="p-2 rounded-full hover:bg-gray-100">
              <ChevronLeft />
            </button>
            <button onClick={goToToday} className="px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-100">
              Today
            </button>
            <button onClick={() => navigateMonth(1)} className="p-2 rounded-full hover:bg-gray-100">
              <ChevronRight />
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="ml-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              Add Task
            </button>
          </div>
        </header>

        {/* Main Calendar */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          
          {/* Month/Year Header */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-4xl font-bold">
                {MONTHS[month]} {year}
              </h2>
              <div className="text-right">
                <div className="text-lg opacity-90">
                  {events.length} Events This Month
                </div>
                <div className="text-sm opacity-75">
                  {getEventsForDate(today).length} Events Today
                </div>
              </div>
            </div>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
            {DAYS_SHORT.map((day, index) => (
              <div key={day} className="p-4 text-center font-semibold text-gray-700 border-r border-gray-200 last:border-r-0">
                <div className="hidden md:block">{DAYS[index]}</div>
                <div className="md:hidden">{day}</div>
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7">
            {calendarDays.map((day, index) => {
              const dayEvents = getEventsForDate(day.fullDate)
              const conflicts = detectConflicts(dayEvents)
              const hasConflicts = conflicts.length > 0
              
              return (
                <div
                  key={index}
                  className={`min-h-[140px] border-r border-b border-gray-200 last:border-r-0 transition-all duration-200 hover:bg-gray-50 cursor-pointer ${
                    !day.isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'bg-white'
                  } ${isToday(day.fullDate) ? 'bg-blue-50 border-blue-200' : ''} ${
                    selectedDate?.toDateString() === day.fullDate.toDateString() ? 'ring-2 ring-blue-400 ring-inset' : ''
                  }`}
                  onClick={() => setSelectedDate(day.fullDate)}
                  role="gridcell"
                  tabIndex={0}
                >
                  <div className="p-3 h-full flex flex-col">
                    {/* Date Number */}
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-lg font-semibold ${
                        isToday(day.fullDate) ? 'text-blue-600' : day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                      }`}>
                        {day.date}
                      </span>
                      {isToday(day.fullDate) && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                      {hasConflicts && (
                        <div title="Schedule conflicts detected">
                          <AlertIcon />
                        </div>
                      )}
                    </div>

                    {/* Events */}
                    <div className="flex-1 space-y-1 overflow-y-auto">
                      {dayEvents.slice(0, 3).map((event, eventIndex) => {
                        const isConflicted = conflicts.some(c => c.event1 === event.id || c.event2 === event.id)
                        
                        return (
                          <div
                            key={event.id}
                            className={`text-xs p-2 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${getEventColor(event.type)} ${
                              isConflicted ? 'ring-2 ring-orange-300' : ''
                            }`}
                            title={`${event.title}\nTime: ${formatTime(event.time)}\nDuration: ${event.duration} minutes${
                              isConflicted ? '\n⚠️ Time conflict detected' : ''
                            }`}
                            onClick={(e) => {
                              e.stopPropagation()
                              alert(`Event Details:\n\nTitle: ${event.title}\nDate: ${event.date}\nTime: ${formatTime(event.time)}\nDuration: ${event.duration} minutes\nType: ${event.type}\nAttendees: ${event.attendees.join(', ')}${
                                isConflicted ? '\n\n⚠️ Warning: This event has scheduling conflicts!' : ''
                              }`)
                            }}
                          >
                            <div className="flex items-center gap-1">
                              <ClockIcon />
                              <span className="font-medium">{formatTime(event.time)}</span>
                              {isConflicted && <AlertIcon />}
                            </div>
                            <div className="font-semibold truncate mt-0.5">{event.title}</div>
                            {event.attendees && (
                              <div className="flex items-center gap-1 mt-1 opacity-70">
                                <UsersIcon />
                                <span className="truncate">{event.attendees.length} attendees</span>
                              </div>
                            )}
                          </div>
                        )
                      })}
                      
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-gray-500 text-center py-1 bg-gray-100 rounded-lg">
                          +{dayEvents.length - 3} more events
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Event Legend & Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Event Types Legend */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Event Types
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {['meeting', 'review', 'presentation', 'planning', 'workshop'].map(type => {
                const count = events.filter(e => e.type === type).length
                return (
                  <div key={type} className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full ${getEventColor(type).split(' ')[0]}`}></div>
                    <span className="capitalize font-medium">{type}</span>
                    <span className="text-gray-500 text-sm">({count})</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Quick Statistics
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Events</span>
                <span className="font-bold text-2xl text-blue-600">{events.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Events Today</span>
                <span className="font-bold text-xl text-green-600">{getEventsForDate(today).length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Conflicts Detected</span>
                <span className="font-bold text-xl text-orange-600">
                  {events.reduce((total, _, index, arr) => {
                    const dayEvents = arr.filter(e => e.date === arr[index].date)
                    return total + detectConflicts(dayEvents).length
                  }, 0)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm py-4">
          <p>Built with React, Tailwind CSS • Assignment Solution</p>
        </div>
      </div>

      {isModalOpen && (
        <AddTaskModal
          onClose={() => setIsModalOpen(false)}
          onAddEvent={handleAddEvent}
          selectedDate={selectedDate}
        />
      )}
    </div>
  )
}