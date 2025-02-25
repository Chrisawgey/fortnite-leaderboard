import React, { useState, useEffect } from 'react';
import { FaTrophy, FaSkull, FaGamepad, FaPercentage, FaStar, FaUserFriends, FaPlus, FaTimes, FaSort, FaSortUp, FaSortDown, FaUser, FaGithub, FaLinkedin, FaHeart, FaCrown } from 'react-icons/fa';

const FortnitePlayerStats = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [player, setPlayer] = useState(null);
  const [friendId, setFriendId] = useState('');
  const [friends, setFriends] = useState([]);
  const [activeTab, setActiveTab] = useState('player');
  const [sortConfig, setSortConfig] = useState({ key: 'kills', direction: 'desc' });
  const [myProfile, setMyProfile] = useState(null);

  // Load friends and myProfile from localStorage on component mount
  useEffect(() => {
    const savedFriends = localStorage.getItem('fortniteFriends');
    const savedProfile = localStorage.getItem('fortniteMyProfile');
    
    if (savedFriends) {
      setFriends(JSON.parse(savedFriends));
    }
    
    if (savedProfile) {
      setMyProfile(JSON.parse(savedProfile));
    }
  }, []);

  // Save friends and myProfile to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('fortniteFriends', JSON.stringify(friends));
  }, [friends]);

  useEffect(() => {
    if (myProfile) {
      localStorage.setItem('fortniteMyProfile', JSON.stringify(myProfile));
    }
  }, [myProfile]);

  const fetchPlayerData = async (username) => {
    try {
      const response = await fetch(`https://fortnite-api.com/v2/stats/br/v2?name=${username}&accountType=epic`, {
        headers: {
          'Authorization': process.env.REACT_APP_FORTNITE_API_KEY
        }
      });

      const data = await response.json();
      if (!response.ok || !data.data) {
        throw new Error(data.error || 'Player not found');
      }

      const stats = data.data.stats.all.overall;
      return {
        username: data.data.account.name || 'Unknown Player',
        level: data.data.battlePass?.level || 0,
        kills: stats.kills || 0,
        wins: stats.wins || 0,
        kd: stats.kd || 0,
        matchesPlayed: stats.matches || 0,
        winRate: stats.winRate || 0
      };
    } catch (error) {
      throw error;
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setError(null);
    setPlayer(null);

    try {
      const playerData = await fetchPlayerData(searchQuery);
      setPlayer(playerData);
      setActiveTab('player');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFriend = async () => {
    if (!friendId.trim()) return;
    
    // Check if friend is already in the list
    if (friends.some(friend => friend.username.toLowerCase() === friendId.toLowerCase())) {
      setError("This player is already in your friends list");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const friendData = await fetchPlayerData(friendId);
      setFriends(prevFriends => [...prevFriends, friendData]);
      setFriendId('');
    } catch (err) {
      setError(`Couldn't add friend: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSetAsMyProfile = () => {
    if (player) {
      setMyProfile(player);
      // Add current player to friends if not already there
      if (!friends.some(f => f.username === player.username)) {
        setFriends(prev => [...prev, player]);
      }
    }
  };

  const handleRemoveFriend = (username) => {
    setFriends(prevFriends => prevFriends.filter(friend => friend.username !== username));
  };

  const handleSort = (key) => {
    let direction = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  const calculateRank = (stats) => {
    // Simple rank calculation based on various stats
    const score = (stats.wins * 5) + (stats.kills * 0.5) + (stats.winRate * 2) + (stats.kd * 10);
    
    if (score > 1000) return { name: "Mythic", color: "from-purple-500 to-pink-600" };
    if (score > 750) return { name: "Legendary", color: "from-yellow-500 to-orange-600" };
    if (score > 500) return { name: "Epic", color: "from-indigo-500 to-purple-600" };
    if (score > 300) return { name: "Rare", color: "from-blue-500 to-indigo-600" };
    if (score > 150) return { name: "Uncommon", color: "from-green-500 to-teal-600" };
    return { name: "Common", color: "from-gray-500 to-gray-600" };
  };

  const sortedFriends = React.useMemo(() => {
    const sortableFriends = [...friends];
    if (sortConfig.key) {
      sortableFriends.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableFriends;
  }, [friends, sortConfig]);

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort className="ml-1 inline text-gray-500" />;
    return sortConfig.direction === 'asc' ? 
      <FaSortUp className="ml-1 inline text-yellow-400" /> : 
      <FaSortDown className="ml-1 inline text-yellow-400" />;
  };

  const getTopStats = () => {
    if (friends.length === 0) return null;
    
    const topKills = [...friends].sort((a, b) => b.kills - a.kills)[0];
    const topWins = [...friends].sort((a, b) => b.wins - a.wins)[0];
    const topKD = [...friends].sort((a, b) => b.kd - a.kd)[0];
    
    return { topKills, topWins, topKD };
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      {/* Header with modern background */}
<div className="p-8 bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 shadow-2xl relative overflow-hidden">
  {/* Subtle animated gradient overlay */}
  <div className="absolute top-0 left-0 w-full h-full opacity-20 animate-gradient-x">
    <div className="absolute top-10 left-10 w-32 h-32 bg-purple-500 rounded-full filter blur-3xl"></div>
    <div className="absolute bottom-10 right-10 w-32 h-32 bg-blue-500 rounded-full filter blur-3xl"></div>
  </div>

  <div className="container mx-auto relative z-10">
    {/* Sleek and modern title */}
    <h1 className="text-5xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-2">
      Fortnite Stats Tracker
    </h1>
    {/* Subtitle with modern font and color */}
    <p className="text-center text-gray-300 text-lg font-light tracking-wide">
      Track your stats and compare with friends
    </p>
          {myProfile && (
            <div 
              className="mt-4 p-3 bg-blue-900/50 backdrop-blur-sm rounded-lg border border-blue-700 max-w-md mx-auto flex items-center gap-4 cursor-pointer hover:bg-blue-900/70 transition"
              onClick={() => {
                setPlayer(myProfile);
                setActiveTab('player');
              }}
            >
              <div className="text-3xl text-yellow-400">
                <FaStar />
              </div>
              <div className="flex-1">
                <p className="text-sm text-blue-300">My Profile</p>
                <p className="font-bold">{myProfile.username}</p>
              </div>
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-3 py-1 rounded-full text-xs">
                {calculateRank(myProfile).name}
              </div>
            </div>
          )}
        </div>
      </div>

      <main className="container mx-auto px-4 py-8 flex-1">
        {/* Search and tabs */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex flex-1 shadow-lg rounded-lg overflow-hidden">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter Epic Games username"
              className="flex-1 px-4 py-3 bg-gray-700 text-white placeholder-gray-400 focus:outline-none border-2 border-transparent focus:border-yellow-500 transition"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              onClick={handleSearch}
              className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-bold transition transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Search'}
            </button>
          </div>
          
          <div className="flex rounded-lg overflow-hidden">
            <button
              onClick={() => setActiveTab('player')}
              className={`px-4 py-2 font-semibold flex items-center gap-2 transition ${
                activeTab === 'player' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <FaStar /> My Stats
            </button>
            <button
              onClick={() => setActiveTab('friends')}
              className={`px-4 py-2 font-semibold flex items-center gap-2 transition ${
                activeTab === 'friends' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <FaUserFriends /> Friends
            </button>
          </div>
        </div>
        
        {loading && 
          <div className="flex justify-center my-8">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        }
        
        {error && 
          <div className="mt-6 p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-300 text-center">
            {error}
          </div>
        }
        
        {activeTab === 'player' && player && (
          <div className="animate-fade-in mt-4">
            <div className="p-6 bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-xl border border-gray-700">
              <div className="flex flex-col items-center mb-6">
                <div className="flex items-center gap-3">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                    {player.username}
                  </h2>
                  {myProfile && myProfile.username === player.username && (
                    <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full flex items-center">
                      <FaUser className="mr-1" /> My Profile
                    </span>
                  )}
                </div>
                
                <div className="mt-2 flex flex-wrap gap-3 justify-center">
                  <div className="text-yellow-400">
                    Battle Pass Level: {player.level}
                  </div>
                  <div className="flex items-center gap-1">
                    <FaCrown className="text-yellow-400" />
                    <span className={`text-transparent bg-clip-text bg-gradient-to-r ${calculateRank(player).color}`}>
                      {calculateRank(player).name} Rank
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-3 mt-4">
                  <button 
                    onClick={() => {
                      // Add current player to friends if not already there
                      if (!friends.some(f => f.username === player.username)) {
                        setFriends(prev => [...prev, player]);
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-full text-sm font-medium flex items-center gap-2 transition transform hover:scale-105"
                  >
                    <FaPlus /> Add to Friends
                  </button>
                  
                  <button 
                    onClick={handleSetAsMyProfile}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-full text-sm font-medium flex items-center gap-2 transition transform hover:scale-105"
                  >
                    <FaUser /> Set as My Profile
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard 
                  icon={<FaTrophy />} 
                  label="Wins" 
                  value={player.wins.toLocaleString()} 
                  color="from-yellow-400 to-yellow-600"
                />
                <StatCard 
                  icon={<FaSkull />} 
                  label="Kills" 
                  value={player.kills.toLocaleString()} 
                  color="from-red-400 to-red-600"
                />
                <StatCard 
                  icon={<FaGamepad />} 
                  label="Matches" 
                  value={player.matchesPlayed.toLocaleString()} 
                  color="from-blue-400 to-blue-600"
                />
                <StatCard 
                  icon={<FaPercentage />} 
                  label="Win Rate" 
                  value={`${player.winRate.toFixed(2)}%`} 
                  color="from-green-400 to-green-600"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="bg-gray-700/50 backdrop-blur-sm rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">K/D Ratio</p>
                    <p className="text-xl font-bold">{player.kd.toFixed(2)}</p>
                  </div>
                  <div className="h-16 w-16 rounded-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg">
                    <span className="text-white font-bold">{player.kd.toFixed(1)}</span>
                  </div>
                </div>
                
                <div className="bg-gray-700/50 backdrop-blur-sm rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Performance Summary</p>
                  <div className="mt-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Win Rate</span>
                      <span>{player.winRate.toFixed(2)}%</span>
                    </div>
                    <div className="w-full bg-gray-600 rounded-full h-2.5">
                      <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${Math.min(player.winRate * 2, 100)}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'friends' && (
          <div className="animate-fade-in mt-4">
            <div className="p-6 bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-xl border border-gray-700">
              <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-center mb-3 md:mb-0">Friend Leaderboard</h2>
              </div>
              
              {/* Top players stats */}
              {friends.length > 0 && getTopStats() && (
                <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in">
                  <TopPlayerCard 
                    title="Most Kills" 
                    player={getTopStats().topKills} 
                    stat={getTopStats().topKills.kills.toLocaleString()} 
                    icon={<FaSkull />}
                    color="from-red-500 to-red-700"
                    isMyProfile={myProfile && myProfile.username === getTopStats().topKills.username}
                  />
                  <TopPlayerCard 
                    title="Most Wins" 
                    player={getTopStats().topWins} 
                    stat={getTopStats().topWins.wins.toLocaleString()} 
                    icon={<FaTrophy />}
                    color="from-yellow-500 to-yellow-700"
                    isMyProfile={myProfile && myProfile.username === getTopStats().topWins.username}
                  />
                  <TopPlayerCard 
                    title="Best K/D" 
                    player={getTopStats().topKD} 
                    stat={getTopStats().topKD.kd.toFixed(2)} 
                    icon={<FaCrown />}
                    color="from-blue-500 to-blue-700"
                    isMyProfile={myProfile && myProfile.username === getTopStats().topKD.username}
                  />
                </div>
              )}
              
              {/* Add friend form */}
              <div className="flex mb-6 shadow-lg rounded-lg overflow-hidden">
                <input
                  type="text"
                  value={friendId}
                  onChange={(e) => setFriendId(e.target.value)}
                  placeholder="Add friend by Epic ID"
                  className="flex-1 px-4 py-3 bg-gray-700 text-white focus:outline-none"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddFriend()}
                />
                <button
                  onClick={handleAddFriend}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold transition"
                  disabled={loading}
                >
                  <FaPlus />
                </button>
              </div>
              
              {/* Friends leaderboard */}
              {friends.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-700/50">
                      <tr>
                        <th className="px-4 py-3 text-left">Username</th>
                        <th className="px-4 py-3 text-center">Rank</th>
                        <th className="px-4 py-3 text-center cursor-pointer" onClick={() => handleSort('kills')}>
                          Kills {getSortIcon('kills')}
                        </th>
                        <th className="px-4 py-3 text-center cursor-pointer" onClick={() => handleSort('wins')}>
                          Wins {getSortIcon('wins')}
                        </th>
                        <th className="px-4 py-3 text-center cursor-pointer" onClick={() => handleSort('winRate')}>
                          Win % {getSortIcon('winRate')}
                        </th>
                        <th className="px-4 py-3 text-center cursor-pointer" onClick={() => handleSort('kd')}>
                          K/D {getSortIcon('kd')}
                        </th>
                        <th className="px-4 py-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedFriends.map((friend, index) => {
                        const rank = calculateRank(friend);
                        const isMyProfile = myProfile && myProfile.username === friend.username;
                        
                        return (
                          <tr 
                            key={friend.username} 
                            className={`border-t border-gray-700 hover:bg-gray-700/30 transition ${
                              index === 0 && sortConfig.direction === 'desc' ? 'bg-yellow-900/20' : ''
                            } ${isMyProfile ? 'bg-green-900/20' : ''}`}
                          >
                            <td className="px-4 py-3 font-medium">
                              {index === 0 && sortConfig.direction === 'desc' && <FaTrophy className="text-yellow-400 inline mr-2" />}
                              {friend.username}
                              {isMyProfile && <FaUser className="text-green-400 inline ml-2" />}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${rank.color} text-white`}>
                                {rank.name}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">{friend.kills.toLocaleString()}</td>
                            <td className="px-4 py-3 text-center">{friend.wins.toLocaleString()}</td>
                            <td className="px-4 py-3 text-center">{friend.winRate.toFixed(2)}%</td>
                            <td className="px-4 py-3 text-center">{friend.kd.toFixed(2)}</td>
                            <td className="px-4 py-3 text-center">
                              <button 
                                onClick={() => handleRemoveFriend(friend.username)}
                                className="p-2 text-gray-400 hover:text-red-500 transition"
                                title="Remove friend"
                              >
                                <FaTimes />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-10 text-gray-400">
                  <FaUserFriends className="text-4xl mx-auto mb-4 opacity-50" />
                  <p>Your friends list is empty</p>
                  <p className="text-sm mt-2">Search for players and add them to start building your leaderboard</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
      
{/* Footer */}
<footer className="bg-gray-900 text-gray-400 py-6 border-t border-gray-800">
  <div className="container mx-auto px-4">
    <div className="flex flex-col md:flex-row items-center justify-between">
      <div className="mb-4 md:mb-0 flex items-center">
        <p className="flex items-center justify-center md:justify-start">
          Created with <FaHeart className="mx-1 text-red-500 animate-pulse" /> by 
          <span className="ml-1 font-bold text-white relative">
            Christopher Vargas
            <span className="absolute -right-4 -top-2 text-xs text-green-400 animate-pulse">👨‍💻</span>
          </span>
        </p>
      </div>
      
      <div className="flex items-center space-x-4">
        <a 
          href="https://github.com/Chrisawgey" 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:text-white transition-colors duration-300 flex items-center hover:scale-105 transform"
        >
          <FaGithub className="mr-2" /> GitHub
        </a>
        <a 
          href="https://www.linkedin.com/in/chrisvpopoca/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:text-white transition-colors duration-300 flex items-center hover:scale-105 transform"
        >
          <FaLinkedin className="mr-2" /> LinkedIn
        </a>
      </div>
    </div>
  </div>
</footer>
    </div>
  );
};

const StatCard = ({ icon, label, value, color }) => (
  <div className="bg-gray-700/50 backdrop-blur-sm p-4 rounded-lg text-center transform transition hover:scale-105 hover:shadow-lg border border-gray-600 hover:border-gray-500">
    <div className={`text-3xl mb-2 bg-gradient-to-br ${color} bg-clip-text text-transparent`}>{icon}</div>
    <p className="text-gray-400 text-sm">{label}</p>
    <p className="text-xl font-bold">{value}</p>
  </div>
);

const TopPlayerCard = ({ title, player, stat, icon, color, isMyProfile }) => (
  <div className={`p-4 rounded-lg animate-pulse-slow bg-gradient-to-r ${color} bg-opacity-20 border-l-4 ${color.split(' ')[1]} flex items-center`}>
    <div className="mr-4 text-2xl">
      {icon}
    </div>
    <div className="flex-1">
      <h3 className="text-sm text-gray-300">{title}</h3>
      <p className="font-bold flex items-center">
        {player.username} 
        {isMyProfile && <FaUser className="text-green-400 ml-2" />}
      </p>
      <p className="text-xl font-bold">{stat}</p>
    </div>
  </div>
);
export default FortnitePlayerStats;