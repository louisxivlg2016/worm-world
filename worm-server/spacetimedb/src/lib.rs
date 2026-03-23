use spacetimedb::{reducer, table, Identity, ReducerContext, Table, Timestamp};
use spacetimedb::rand::Rng;

// ─── Tables ───

#[table(accessor = player, public)]
pub struct Player {
    #[primary_key]
    pub identity: Identity,
    pub username: String,
    pub online: bool,
    pub wins: u32,
    pub coins: u32,
}

#[table(accessor = room, public)]
pub struct Room {
    #[primary_key]
    #[auto_inc]
    pub id: u64,
    #[unique]
    pub slug: String,
    pub name: String,
    pub host: Identity,
    pub is_public: bool,
    pub game_mode: String,
    pub max_players: u32,
    pub seed: u32,
    pub created_at: Timestamp,
}

#[table(accessor = room_member, public)]
pub struct RoomMember {
    #[primary_key]
    #[auto_inc]
    pub id: u64,
    #[index(btree)]
    pub room_id: u64,
    pub identity: Identity,
    pub username: String,
    pub eliminated: bool,
}

#[table(accessor = player_state, public)]
pub struct PlayerState {
    #[primary_key]
    pub identity: Identity,
    #[index(btree)]
    pub room_id: u64,
    pub x: f64,
    pub y: f64,
    pub angle: f64,
    pub score: u32,
    pub alive: bool,
    pub segments_count: u32,
    pub boosting: bool,
    pub skin_json: String,
    pub name: String,
}

#[table(accessor = game_event, public)]
pub struct GameEvent {
    #[primary_key]
    #[auto_inc]
    pub id: u64,
    pub room_id: u64,
    pub sender_identity: Identity,
    pub event_type: String,
    pub payload_json: String,
}

// ─── Lifecycle ───

#[reducer(init)]
pub fn init(_ctx: &ReducerContext) {}

#[reducer(client_connected)]
pub fn client_connected(ctx: &ReducerContext) {
    let sender = ctx.sender();
    if let Some(p) = ctx.db.player().identity().find(sender) {
        ctx.db.player().identity().update(Player {
            online: true,
            ..p
        });
    } else {
        ctx.db.player().insert(Player {
            identity: sender,
            username: String::new(),
            online: true,
            wins: 0,
            coins: 0,
        });
    }
}

#[reducer(client_disconnected)]
pub fn client_disconnected(ctx: &ReducerContext) {
    let sender = ctx.sender();

    if let Some(p) = ctx.db.player().identity().find(sender) {
        ctx.db.player().identity().update(Player {
            online: false,
            ..p
        });
    }

    // Remove player state
    if ctx.db.player_state().identity().find(sender).is_some() {
        ctx.db.player_state().identity().delete(sender);
    }

    // Remove from room memberships and clean up empty rooms
    let memberships: Vec<RoomMember> = ctx
        .db
        .room_member()
        .iter()
        .filter(|m| m.identity == sender)
        .collect();

    for member in memberships {
        ctx.db.room_member().id().delete(&member.id);

        let remaining = ctx
            .db
            .room_member()
            .room_id()
            .filter(&member.room_id)
            .count();
        if remaining == 0 {
            for evt in ctx
                .db
                .game_event()
                .iter()
                .filter(|e| e.room_id == member.room_id)
                .collect::<Vec<_>>()
            {
                ctx.db.game_event().id().delete(&evt.id);
            }
            ctx.db.room().id().delete(&member.room_id);
        }
    }
}

// ─── Player ───

#[reducer]
pub fn set_username(ctx: &ReducerContext, username: String) -> Result<(), String> {
    let sender = ctx.sender();
    let p = ctx
        .db
        .player()
        .identity()
        .find(sender)
        .ok_or("Player not found")?;
    ctx.db.player().identity().update(Player { username, ..p });
    Ok(())
}

// ─── Rooms ───

#[reducer]
pub fn create_room(
    ctx: &ReducerContext,
    name: String,
    is_public: bool,
    game_mode: String,
    max_players: u32,
) -> Result<(), String> {
    let sender = ctx.sender();

    if name.trim().is_empty() {
        return Err("Room name cannot be empty".into());
    }

    let slug = {
        let chars = b"abcdefghijklmnopqrstuvwxyz0123456789";
        let mut s = String::with_capacity(6);
        for _ in 0..6 {
            let idx = (ctx.rng().gen::<u32>() as usize) % chars.len();
            s.push(chars[idx] as char);
        }
        s
    };

    let seed = ctx.rng().gen::<u32>();

    let room = ctx.db.room().insert(Room {
        id: 0,
        slug,
        name,
        host: sender,
        is_public,
        game_mode,
        max_players,
        seed,
        created_at: ctx.timestamp,
    });

    let username = ctx
        .db
        .player()
        .identity()
        .find(sender)
        .map(|p| p.username.clone())
        .unwrap_or_default();

    ctx.db.room_member().insert(RoomMember {
        id: 0,
        room_id: room.id,
        identity: sender,
        username,
        eliminated: false,
    });

    Ok(())
}

#[reducer]
pub fn join_room(ctx: &ReducerContext, slug: String) -> Result<(), String> {
    let sender = ctx.sender();

    let room = ctx
        .db
        .room()
        .slug()
        .find(&slug)
        .ok_or("Room not found")?;

    let member_count = ctx.db.room_member().room_id().filter(&room.id).count();
    if member_count as u32 >= room.max_players {
        return Err("Room is full".into());
    }

    let already = ctx
        .db
        .room_member()
        .room_id()
        .filter(&room.id)
        .any(|m| m.identity == sender);
    if already {
        return Ok(());
    }

    let username = ctx
        .db
        .player()
        .identity()
        .find(sender)
        .map(|p| p.username.clone())
        .unwrap_or_default();

    ctx.db.room_member().insert(RoomMember {
        id: 0,
        room_id: room.id,
        identity: sender,
        username,
        eliminated: false,
    });

    Ok(())
}

#[reducer]
pub fn leave_room(ctx: &ReducerContext, room_id: u64) -> Result<(), String> {
    let sender = ctx.sender();

    let member = ctx
        .db
        .room_member()
        .room_id()
        .filter(&room_id)
        .find(|m| m.identity == sender);

    if let Some(m) = member {
        ctx.db.room_member().id().delete(&m.id);
    }

    // Remove player state
    if ctx.db.player_state().identity().find(sender).is_some() {
        ctx.db.player_state().identity().delete(sender);
    }

    // If room is empty, delete it
    let remaining = ctx.db.room_member().room_id().filter(&room_id).count();
    if remaining == 0 {
        for evt in ctx
            .db
            .game_event()
            .iter()
            .filter(|e| e.room_id == room_id)
            .collect::<Vec<_>>()
        {
            ctx.db.game_event().id().delete(&evt.id);
        }
        ctx.db.room().id().delete(&room_id);
    }

    Ok(())
}

#[reducer]
pub fn delete_room(ctx: &ReducerContext, room_id: u64) -> Result<(), String> {
    let sender = ctx.sender();
    let room = ctx.db.room().id().find(&room_id).ok_or("Room not found")?;
    if room.host != sender {
        return Err("Only host can delete room".into());
    }

    for m in ctx
        .db
        .room_member()
        .room_id()
        .filter(&room_id)
        .collect::<Vec<_>>()
    {
        ctx.db.room_member().id().delete(&m.id);
    }

    for ps in ctx
        .db
        .player_state()
        .room_id()
        .filter(&room_id)
        .collect::<Vec<_>>()
    {
        ctx.db.player_state().identity().delete(ps.identity);
    }

    for evt in ctx
        .db
        .game_event()
        .iter()
        .filter(|e| e.room_id == room_id)
        .collect::<Vec<_>>()
    {
        ctx.db.game_event().id().delete(&evt.id);
    }

    ctx.db.room().id().delete(&room_id);
    Ok(())
}

#[reducer]
pub fn update_game_mode(
    ctx: &ReducerContext,
    room_id: u64,
    game_mode: String,
) -> Result<(), String> {
    let sender = ctx.sender();
    let room = ctx.db.room().id().find(&room_id).ok_or("Room not found")?;
    if room.host != sender {
        return Err("Only host can update game mode".into());
    }
    ctx.db.room().id().update(Room { game_mode, ..room });
    Ok(())
}

// ─── Player State ───

#[reducer]
pub fn update_player_state(
    ctx: &ReducerContext,
    room_id: u64,
    x: f64,
    y: f64,
    angle: f64,
    score: u32,
    alive: bool,
    segments_count: u32,
    boosting: bool,
    skin_json: String,
    name: String,
) {
    let sender = ctx.sender();
    if let Some(existing) = ctx.db.player_state().identity().find(sender) {
        ctx.db.player_state().identity().update(PlayerState {
            x,
            y,
            angle,
            score,
            alive,
            segments_count,
            boosting,
            skin_json,
            name,
            ..existing
        });
    } else {
        ctx.db.player_state().insert(PlayerState {
            identity: sender,
            room_id,
            x,
            y,
            angle,
            score,
            alive,
            segments_count,
            boosting,
            skin_json,
            name,
        });
    }
}

// ─── Game Events ───

#[reducer]
pub fn broadcast_game_event(
    ctx: &ReducerContext,
    room_id: u64,
    event_type: String,
    payload_json: String,
) {
    let sender = ctx.sender();
    ctx.db.game_event().insert(GameEvent {
        id: 0,
        room_id,
        sender_identity: sender,
        event_type,
        payload_json,
    });
}

// ─── Game Round Reset ───

#[reducer]
pub fn clear_game_events(ctx: &ReducerContext, room_id: u64) {
    // Delete all game events for this room (used between rounds)
    let events: Vec<GameEvent> = ctx
        .db
        .game_event()
        .iter()
        .filter(|e| e.room_id == room_id)
        .collect();
    for evt in events {
        ctx.db.game_event().id().delete(&evt.id);
    }

    // Reset all player states in this room (alive=true, score=0)
    let states: Vec<PlayerState> = ctx
        .db
        .player_state()
        .room_id()
        .filter(&room_id)
        .collect();
    for ps in states {
        ctx.db.player_state().identity().update(PlayerState {
            alive: true,
            score: 0,
            ..ps
        });
    }

    // Reset room members eliminated status
    let members: Vec<RoomMember> = ctx
        .db
        .room_member()
        .room_id()
        .filter(&room_id)
        .collect();
    for m in members {
        ctx.db.room_member().id().update(RoomMember {
            eliminated: false,
            ..m
        });
    }
}

// ─── Stats ───

#[reducer]
pub fn report_win(ctx: &ReducerContext) -> Result<(), String> {
    let sender = ctx.sender();
    let p = ctx
        .db
        .player()
        .identity()
        .find(sender)
        .ok_or("Player not found")?;
    ctx.db.player().identity().update(Player {
        wins: p.wins + 1,
        coins: p.coins + 80,
        ..p
    });
    Ok(())
}

#[reducer]
pub fn add_coins(ctx: &ReducerContext, amount: u32) -> Result<(), String> {
    let sender = ctx.sender();
    let p = ctx
        .db
        .player()
        .identity()
        .find(sender)
        .ok_or("Player not found")?;
    ctx.db.player().identity().update(Player {
        coins: p.coins + amount,
        ..p
    });
    Ok(())
}

#[reducer]
pub fn mark_eliminated(ctx: &ReducerContext, room_id: u64) -> Result<(), String> {
    let sender = ctx.sender();
    let member = ctx
        .db
        .room_member()
        .room_id()
        .filter(&room_id)
        .find(|m| m.identity == sender)
        .ok_or("Not a member")?;

    ctx.db.room_member().id().update(RoomMember {
        eliminated: true,
        ..member
    });
    Ok(())
}
