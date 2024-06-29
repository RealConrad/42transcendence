
const startMatchmaking = () => {
    console.log("Trying to setup conneciton....");
    const matchmakingSocket = new WebSocket('ws://127.0.0.1:8002/ws/matchmaking/')

    matchmakingSocket.onopen = () => {
        console.log("Matchmaking socket connection established");
        matchmakingSocket.send(JSON.stringify({
            action: 'join_queue',
            // Generate a random player name for testing purposes.
            username: 'player_' + Math.random()
        }));
    }

    matchmakingSocket.onmessage = (e) => {
        const data = JSON.parse(e.data)
        console.log('Message received: ', data);

        if (data.type === 'match_found') {
            console.log("Match found: ", data.message);
        }
    }

    matchmakingSocket.onclose = function(e) {
        console.log('Matchmaking WebSocket connection closed');
    };
}

window.onload = () => {
    console.log("Page loaded");
    startMatchmaking();
}