import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getMyProfile, getMyTeachingStats, updateMyProfile, uploadMyAvatar } from '@/services/users.api'
import { useAuth } from '@/contexts/AuthContext'

// Any authenticated role — fetches the logged-in user's full profile
export function useMyProfile() {
  return useQuery({
    queryKey: ['my-profile'],
    queryFn: getMyProfile,
  })
}

// INSTRUCTOR/ADMIN — aggregate teaching activity for the profile page
export function useTeachingStats() {
  return useQuery({
    queryKey: ['my-teaching-stats'],
    queryFn: getMyTeachingStats,
  })
}

// Update name (and/or avatar URL directly, if you already have one)
export function useUpdateProfile() {
  const queryClient = useQueryClient()
  const { updateUser } = useAuth()
  return useMutation({
    mutationFn: updateMyProfile,
    onSuccess: (updated) => {
      queryClient.setQueryData(['my-profile'], updated)
      updateUser({ name: updated.name, avatar: updated.avatar ?? undefined })
    },
  })
}

// Upload a new avatar image file
export function useUploadAvatar() {
  const queryClient = useQueryClient()
  const { updateUser } = useAuth()
  return useMutation({
    mutationFn: uploadMyAvatar,
    onSuccess: (updated) => {
      queryClient.setQueryData(['my-profile'], updated)
      updateUser({ name: updated.name, avatar: updated.avatar ?? undefined })
    },
  })
}
