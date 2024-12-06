
function TabBar({ activeTab, setActiveTab }) {
    const tabs = ['Manage Rooms', 'Chat', 'Requests', 'Tab 4', 'Tab 5'];

    return (
        <ul className="tab-list">
            {tabs.map((tab, index) => (
                <li key={index} className={activeTab === tab ? 'active' : ''} onClick={() => setActiveTab(tab)}>
                    {tab}
                </li>
            ))}
        </ul>
    );
}

export default TabBar;
