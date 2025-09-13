"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Mail, Phone, Calendar } from "lucide-react"
import type { User } from "@/lib/types"
import { usersApi } from "@/lib/api"
import { format } from "date-fns"

export function UserManagement() {
  const [users, setUsers] = useState<Omit<User, 'password'>[]>([])
  const [filteredUsers, setFilteredUsers] = useState<Omit<User, 'password'>[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [editingUser, setEditingUser] = useState<Omit<User, 'password'> | null>(null)
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: ''
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      console.log('Fetching users from API...')
      const response = await usersApi.getAllUsers()
      console.log('API Response:', response)
      
      if (response.success && response.data) {
        // Filter out admin users - only show regular users
        const regularUsers = response.data.filter(user => user.is_adman !== "admin")
        console.log('Regular users fetched successfully:', regularUsers)
        setUsers(regularUsers)
        setFilteredUsers(regularUsers)
      } else {
        console.error('Failed to fetch users:', response.error)
        alert(`Failed to fetch users: ${response.error}`)
        setUsers([])
        setFilteredUsers([])
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      alert(`Error fetching users: ${error}`)
      setUsers([])
      setFilteredUsers([])
    }
    setIsLoading(false)
  }

  useEffect(() => {
    const filtered = users.filter(
      (user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone_number?.includes(searchTerm),
    )
    setFilteredUsers(filtered)
  }, [searchTerm, users])

  const handleEditUser = (user: Omit<User, 'password'>) => {
    setEditingUser(user)
    setEditForm({
      firstName: user.name?.split(' ')[0] || '',
      lastName: user.name?.split(' ').slice(1).join(' ') || '',
      email: user.email,
      phone: user.phone_number || '',
      dateOfBirth: user.DOB || ''
    })
  }

  const handleUpdateUser = async () => {
    if (!editingUser) return
    
    try {
      console.log('Updating user:', editingUser.id, 'with data:', editForm)
      const response = await usersApi.updateUser(editingUser.id, editForm)
      console.log('Update response:', response)
      
      if (response.success && response.data) {
        // Update user in local state
        setUsers((prev) => prev.map((user) => 
          user.id === editingUser.id ? response.data! : user
        ))
        setEditingUser(null)
        alert('User updated successfully')
      } else {
        console.error('Failed to update user:', response.error)
        alert(`Failed to update user: ${response.error}`)
      }
    } catch (error) {
      console.error('Error updating user:', error)
      alert(`Error updating user: ${error}`)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return
    
    try {
      const response = await usersApi.deleteUser(userId)
      
      if (response.success) {
        // Remove user from local state
        setUsers((prev) => prev.filter((user) => user.id !== userId))
        alert('User deleted successfully')
      } else {
        console.error('Failed to delete user:', response.error)
        alert(`Failed to delete user: ${response.error}`)
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      alert(`Error deleting user: ${error}`)
    }
  }

  const getInitials = (name: string) => {
    if (!name) return 'U'
    const nameParts = name.trim().split(' ')
    if (nameParts.length >= 2) {
      return `${nameParts[0].charAt(0)}${nameParts[nameParts.length - 1].charAt(0)}`.toUpperCase()
    }
    return name.charAt(0).toUpperCase()
  }

  const getRoleBadgeColor = (role: string) => {
    return role === "admin" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-gray-600">Manage system users and their access</p>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search Users</CardTitle>
          <CardDescription>Find users by name, email, or phone number</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
          <CardDescription>All registered users in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {user.name}
                          </p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="h-3 w-3 mr-2" />
                          <span className="truncate max-w-[200px]">{user.email}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="h-3 w-3 mr-2" />
                          <span>{user.phone_number}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRoleBadgeColor(user.is_adman === "admin" ? 'admin' : 'user')}>
                        {user.is_adman === "admin" ? 'Admin' : 'User'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-3 w-3 mr-2" />
                        <span>{format(new Date(user.createdAt), "MMM dd, yyyy")}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditUser(user)}
                        >
                          Update
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-600">Try adjusting your search criteria</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-white bg-opacity-95 flex items-center justify-center z-50">
          <Card className="w-96 max-w-md shadow-2xl border-2">
            <CardHeader className="bg-blue-50">
              <CardTitle className="text-blue-900">Edit User</CardTitle>
              <CardDescription className="text-blue-700">Update user information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 bg-white p-6">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">First Name</label>
                <Input
                  value={editForm.firstName}
                  onChange={(e) => setEditForm({...editForm, firstName: e.target.value})}
                  placeholder="First name"
                  className="border-gray-300 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Last Name</label>
                <Input
                  value={editForm.lastName}
                  onChange={(e) => setEditForm({...editForm, lastName: e.target.value})}
                  placeholder="Last name"
                  className="border-gray-300 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Email</label>
                <Input
                  value={editForm.email}
                  onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                  placeholder="Email"
                  type="email"
                  className="border-gray-300 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Phone</label>
                <Input
                  value={editForm.phone}
                  onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                  placeholder="Phone number"
                  className="border-gray-300 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Date of Birth</label>
                <Input
                  value={editForm.dateOfBirth}
                  onChange={(e) => setEditForm({...editForm, dateOfBirth: e.target.value})}
                  placeholder="YYYY-MM-DD"
                  type="date"
                  className="border-gray-300 focus:border-blue-500"
                />
              </div>
              <div className="flex space-x-2 pt-4">
                <Button onClick={handleUpdateUser} className="flex-1 bg-blue-600 hover:bg-blue-700">
                  Save Changes
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setEditingUser(null)}
                  className="flex-1 border-gray-300 hover:bg-gray-50"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
