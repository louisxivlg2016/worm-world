export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          skin: string
          skin_color: string | null
          shirt_color: string | null
          pants_color: string | null
          hair_color: string | null
          shoe_color: string | null
          wins: number
          platform: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          skin?: string
          skin_color?: string | null
          shirt_color?: string | null
          pants_color?: string | null
          hair_color?: string | null
          shoe_color?: string | null
          wins?: number
          platform?: string
        }
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      rooms: {
        Row: {
          id: string
          name: string
          slug: string
          host_id: string
          is_public: boolean
          seed: number
          game_mode: string
          max_players: number
          created_at: string
          updated_at: string
        }
        Insert: {
          name: string
          slug: string
          host_id: string
          is_public?: boolean
          seed?: number
          game_mode?: string
          max_players?: number
        }
        Update: Partial<Database['public']['Tables']['rooms']['Insert']>
      }
      room_members: {
        Row: {
          room_id: string
          user_id: string
          eliminated: boolean
          joined_at: string
        }
        Insert: {
          room_id: string
          user_id: string
          eliminated?: boolean
        }
        Update: Partial<Database['public']['Tables']['room_members']['Insert']>
      }
      world_events: {
        Row: {
          id: number
          room_id: string
          user_id: string
          event_type: string
          payload: Record<string, unknown>
          created_at: string
        }
        Insert: {
          room_id: string
          user_id: string
          event_type: string
          payload?: Record<string, unknown>
        }
        Update: Partial<Database['public']['Tables']['world_events']['Insert']>
      }
      mission_completions: {
        Row: {
          id: number
          room_id: string
          user_id: string
          mission_id: number
          completed_at: string
        }
        Insert: {
          room_id: string
          user_id: string
          mission_id: number
        }
        Update: Partial<Database['public']['Tables']['mission_completions']['Insert']>
      }
      pvp_kills: {
        Row: {
          id: number
          room_id: string
          killer_id: string
          victim_id: string
          weapon: string
          created_at: string
        }
        Insert: {
          room_id: string
          killer_id: string
          victim_id: string
          weapon: string
        }
        Update: Partial<Database['public']['Tables']['pvp_kills']['Insert']>
      }
    }
    Functions: {
      increment_wins: {
        Args: { p_user_id: string }
        Returns: void
      }
    }
  }
}
