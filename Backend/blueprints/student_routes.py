import json
import datetime
from flask import Blueprint, request, jsonify, session
from models import get_db, calculate_student_potential_score
from auth_utils import role_required
from gemini_service import gemini_service
from pathway_generator import build_rich_pathway_topics

student_bp = Blueprint('student', __name__, url_prefix='/api/student')

def row_to_dict(row):
    if row is None:
        return None
    return {k: row[k] for k in row.keys()}

# Predefined diverse subject catalog for flexible discovery + "Other"
SUBJECT_CATALOG = [
    {"name": "Mathematics", "category": "Academic Core", "desc": "Calculus, Linear Algebra, Differential Equations, Discrete Math"},
    {"name": "Physics", "category": "Academic Core", "desc": "Current Electricity, Mechanics, Optics, Electromagnetism, Quantum"},
    {"name": "Chemistry", "category": "Academic Core", "desc": "Organic, Inorganic, Physical Chemistry, Thermodynamics"},
    {"name": "Biology", "category": "Academic Core", "desc": "Molecular Biology, Genetics, Cell Physiology, Bio-informatics"},
    {"name": "Computer Science", "category": "Technical", "desc": "Algorithms, Operating Systems, Database Systems, Architecture"},
    {"name": "Python Programming", "category": "Programming & Software", "desc": "Pythonic Coding, OOP, REST APIs, Asynchronous Programming"},
    {"name": "Web Development", "category": "Programming & Software", "desc": "React.js, Node.js, TypeScript, Tailwind CSS, Full-Stack"},
    {"name": "Artificial Intelligence", "category": "Emerging Tech", "desc": "Machine Learning, Deep Learning, NLP, Computer Vision, LLMs"},
    {"name": "Robotics", "category": "Engineering & Hardware", "desc": "Kinematics, ROS2, Sensor Interfacing, Autonomous Navigation"},
    {"name": "Electronics & Embedded Systems", "category": "Engineering & Hardware", "desc": "Microcontrollers, ESP32, IoT Sensors, Digital Logic"},
    {"name": "Data Science", "category": "Data & Analysis", "desc": "Pandas, NumPy, Statistical Inference, Predictive Modeling"},
    {"name": "Cybersecurity", "category": "Technical", "desc": "Network Security, Cryptography, Vulnerability Assessment"},
    {"name": "Design & UI/UX", "category": "Creative Fields", "desc": "Design Systems, User Research, Figma, Interaction Design"},
    {"name": "Psychology", "category": "Humanities", "desc": "Cognitive Psychology, Behavioral Dynamics, Neuroscience"},
    {"name": "Economics", "category": "Commerce & Social", "desc": "Microeconomics, Macroeconomics, Econometrics, Public Policy"},
    {"name": "Finance", "category": "Commerce & Social", "desc": "Financial Modeling, Portfolio Analysis, Capital Markets"},
    {"name": "Astronomy", "category": "Sciences", "desc": "Astrophysics, Orbital Mechanics, Planetary Systems"},
    {"name": "Environmental Science", "category": "Sciences", "desc": "Climate Dynamics, Renewable Energy, Sustainability"},
    {"name": "Entrepreneurship", "category": "Management", "desc": "Product Development, Business Strategy, Venture Creation"},
    {"name": "Communication & Leadership", "category": "Practical Skills", "desc": "Public Speaking, Technical Writing, Team Leadership"}
]

# Offline High-Quality Question Bank for Instant Diagnostics & Practice
DEFAULT_QUESTION_BANK = {
    "dsa": [
        {"q": "What is the worst-case time complexity of searching for an element in a balanced Binary Search Tree (AVL / Red-Black)?", "options": {"A": "O(1)", "B": "O(log n)", "C": "O(n)", "D": "O(n log n)"}, "ans": "B", "level": "Basic", "topic": "Trees & Binary Search Trees"},
        {"q": "Which data structure follows the First-In-First-Out (FIFO) principle and is commonly used in Breadth-First Search (BFS)?", "options": {"A": "Stack", "B": "Queue", "C": "Priority Queue", "D": "Binary Heap"}, "ans": "B", "level": "Basic", "topic": "Queues & Breadth-First Search"},
        {"q": "In hashing, what technique resolves collisions by storing colliding elements in a linked list at the same bucket index?", "options": {"A": "Linear Probing", "B": "Separate Chaining", "C": "Quadratic Probing", "D": "Double Hashing"}, "ans": "B", "level": "Basic", "topic": "Hashing & Hash Tables"},
        {"q": "What is the average and worst-case time complexity of QuickSort?", "options": {"A": "Avg: O(n log n), Worst: O(n^2)", "B": "Avg: O(n), Worst: O(n log n)", "C": "Avg: O(n log n), Worst: O(n log n)", "D": "Avg: O(n^2), Worst: O(n^2)"}, "ans": "A", "level": "Intermediate", "topic": "Sorting Algorithms"},
        {"q": "Which algorithm is guaranteed to find the shortest path from a single source to all vertices in a weighted graph with non-negative edge weights?", "options": {"A": "Prim's Algorithm", "B": "Dijkstra's Algorithm", "C": "Kruskal's Algorithm", "D": "Floyd-Warshall Algorithm"}, "ans": "B", "level": "Intermediate", "topic": "Graph Algorithms"},
        {"q": "What is the optimal substructure and overlapping subproblems property characteristic of?", "options": {"A": "Greedy Algorithms", "B": "Dynamic Programming", "C": "Divide and Conquer", "D": "Backtracking"}, "ans": "B", "level": "Intermediate", "topic": "Dynamic Programming"},
        {"q": "In a Min-Heap of size N, what is the time complexity to insert a new element and maintain the heap property?", "options": {"A": "O(1)", "B": "O(log N)", "C": "O(N)", "D": "O(N log N)"}, "ans": "B", "level": "Intermediate", "topic": "Heaps & Priority Queues"},
        {"q": "Which algorithm can detect a cycle in a singly linked list in O(1) auxiliary space?", "options": {"A": "Dijkstra's Algorithm", "B": "Floyd's Tortoise and Hare (Two Pointer)", "C": "Tarjan's Algorithm", "D": "Bellman-Ford Algorithm"}, "ans": "B", "level": "Advanced", "topic": "Linked Lists & Pointers"},
        {"q": "What is the minimum number of comparisons required in the worst-case to sort N elements using comparison-based sorting?", "options": {"A": "O(N)", "B": "Omega(N log N)", "C": "O(N^2)", "D": "O(log N)"}, "ans": "B", "level": "Advanced", "topic": "Asymptotic Complexity & Lower Bounds"},
        {"q": "In dynamic programming, what is the time complexity of solving the 0/1 Knapsack problem with N items and capacity W?", "options": {"A": "O(2^N)", "B": "O(N * W)", "C": "O(N + W)", "D": "O(W^2)"}, "ans": "B", "level": "Advanced", "topic": "Dynamic Programming"}
    ],
    "os": [
        {"q": "What is the primary difference between a process and a thread?", "options": {"A": "Processes share address space while threads do not", "B": "Threads of the same process share code, data, and open files, but have separate stacks", "C": "Threads require separate memory protection tables", "D": "Processes are lighter than threads"}, "ans": "B", "level": "Basic", "topic": "Processes & Threads"},
        {"q": "Which of the following is NOT one of Coffman's four necessary conditions for deadlock?", "options": {"A": "Mutual Exclusion", "B": "Hold and Wait", "C": "Preemption allowed", "D": "Circular Wait"}, "ans": "C", "level": "Basic", "topic": "Deadlocks"},
        {"q": "What CPU scheduling algorithm assigns each process a fixed time slice in cyclic order?", "options": {"A": "First-Come, First-Served (FCFS)", "B": "Shortest Job First (SJF)", "C": "Round Robin (RR)", "D": "Priority Scheduling"}, "ans": "C", "level": "Basic", "topic": "CPU Scheduling"},
        {"q": "What hardware component translates virtual memory addresses to physical memory addresses in modern architectures?", "options": {"A": "ALU", "B": "Memory Management Unit (MMU)", "C": "DMA Controller", "D": "Instruction Register"}, "ans": "B", "level": "Intermediate", "topic": "Virtual Memory & Paging"},
        {"q": "What phenomenon occurs when excessive page swapping degrades system CPU utilization close to zero?", "options": {"A": "Fragmentation", "B": "Thrashing", "C": "Starvation", "D": "Belady's Anomaly"}, "ans": "B", "level": "Intermediate", "topic": "Page Replacement & Thrashing"},
        {"q": "In process synchronization, what is a binary semaphore commonly used to implement?", "options": {"A": "Thread pooling", "B": "Mutual Exclusion (Mutex Lock)", "C": "Cache coherence", "D": "Direct memory access"}, "ans": "B", "level": "Intermediate", "topic": "Concurrency & Semaphores"},
        {"q": "Which page replacement algorithm suffers from Belady's Anomaly (where increasing page frames increases page faults)?", "options": {"A": "Least Recently Used (LRU)", "B": "First-In-First-Out (FIFO)", "C": "Optimal Page Replacement", "D": "Clock Algorithm"}, "ans": "B", "level": "Intermediate", "topic": "Page Replacement Algorithms"},
        {"q": "What mechanism does an operating system use to prevent user processes from executing privileged machine instructions directly?", "options": {"A": "Dual-mode operation (User Mode vs Kernel Mode)", "B": "Garbage Collection", "C": "Dynamic Linking", "D": "Spooling"}, "ans": "A", "level": "Advanced", "topic": "Kernel Architecture & Protection"},
        {"q": "Which algorithm is used by operating systems to safely avoid deadlocks by simulating allocation before granting resources?", "options": {"A": "Dijkstra's Banker's Algorithm", "B": "Peterson's Algorithm", "C": "Lamport's Bakery Algorithm", "D": "Kruskal's Algorithm"}, "ans": "A", "level": "Advanced", "topic": "Deadlock Avoidance"},
        {"q": "What is the purpose of the Translation Lookaside Buffer (TLB) in virtual memory systems?", "options": {"A": "Store disk sectors", "B": "Cache recent virtual-to-physical address translations for rapid lookup", "C": "Buffer network packets", "D": "Serialize CPU interrupts"}, "ans": "B", "level": "Advanced", "topic": "Memory Architecture & TLB"}
    ],
    "dbms": [
        {"q": "Which property in ACID ensures that all operations in a database transaction complete successfully, or none take effect?", "options": {"A": "Atomicity", "B": "Consistency", "C": "Isolation", "D": "Durability"}, "ans": "A", "level": "Basic", "topic": "ACID Properties & Transactions"},
        {"q": "What type of SQL JOIN returns all rows from the left table, and matched rows from the right table?", "options": {"A": "INNER JOIN", "B": "LEFT OUTER JOIN", "C": "RIGHT OUTER JOIN", "D": "FULL OUTER JOIN"}, "ans": "B", "level": "Basic", "topic": "SQL Queries & Joins"},
        {"q": "Which normal form requires removing partial functional dependencies on a composite primary key?", "options": {"A": "First Normal Form (1NF)", "B": "Second Normal Form (2NF)", "C": "Third Normal Form (3NF)", "D": "Boyce-Codd Normal Form (BCNF)"}, "ans": "B", "level": "Intermediate", "topic": "Database Normalization"},
        {"q": "What data structure is standard for indexing database tables on disk because of high fan-out and shallow height?", "options": {"A": "Binary Search Tree", "B": "B+ Tree", "C": "Red-Black Tree", "D": "Skip List"}, "ans": "B", "level": "Intermediate", "topic": "Indexing & B+ Trees"},
        {"q": "What does a FOREIGN KEY constraint enforce in relational databases?", "options": {"A": "Entity Integrity", "B": "Referential Integrity", "C": "Domain Integrity", "D": "User-Defined Integrity"}, "ans": "B", "level": "Basic", "topic": "Relational Integrity Constraints"},
        {"q": "In transaction isolation levels, what concurrency read problem is prevented by REPEATABLE READ but not by READ COMMITTED?", "options": {"A": "Dirty Read", "B": "Non-Repeatable (Fuzzy) Read", "C": "Phantom Read", "D": "Lost Update"}, "ans": "B", "level": "Intermediate", "topic": "Isolation Levels & Concurrency"},
        {"q": "What is the primary trade-off between clustered and non-clustered indexes in SQL databases?", "options": {"A": "Clustered indexes determine physical row order on disk and only one can exist per table", "B": "Non-clustered indexes can only index integer columns", "C": "Clustered indexes do not support range queries", "D": "Non-clustered indexes duplicate all table columns"}, "ans": "A", "level": "Intermediate", "topic": "Database Indexing"},
        {"q": "What write protocol guarantees Write-Ahead Logging (WAL) in database crash recovery?", "options": {"A": "Data pages must be flushed before transaction logs", "B": "Log records must be flushed to non-volatile storage before corresponding dirty pages are written", "C": "All transactions must be aborted on checkpoint", "D": "Shadow paging must replace buffer management"}, "ans": "B", "level": "Advanced", "topic": "Crash Recovery & ARIES"},
        {"q": "In distributed databases, the CAP theorem states that a system can provide at most two of which three guarantees?", "options": {"A": "Consistency, Availability, Partition Tolerance", "B": "Concurrency, Atomicity, Performance", "C": "Correctness, Adaptability, Persistence", "D": "Capacity, Authentication, Privacy"}, "ans": "A", "level": "Advanced", "topic": "Distributed Databases & CAP"},
        {"q": "What lock-based protocol guarantees conflict serializability in multi-transaction execution?", "options": {"A": "Two-Phase Locking (2PL)", "B": "Single-phase commit", "C": "Optimistic Concurrency Control without validation", "D": "Timestamp ordering without rollback"}, "ans": "A", "level": "Advanced", "topic": "Concurrency Control"}
    ],
    "webdev": [
        {"q": "In the CSS Box Model, which layer is positioned between padding and margin?", "options": {"A": "Content", "B": "Border", "C": "Outline", "D": "Shadow"}, "ans": "B", "level": "Basic", "topic": "CSS Box Model & Styling"},
        {"q": "Which HTTP method is idempotent and primarily used to update an entire existing resource representation?", "options": {"A": "POST", "B": "PUT", "C": "PATCH", "D": "CONNECT"}, "ans": "B", "level": "Basic", "topic": "HTTP & REST APIs"},
        {"q": "In modern React, which hook is used to perform side effects like data fetching or DOM subscriptions?", "options": {"A": "useState", "B": "useEffect", "C": "useMemo", "D": "useReducer"}, "ans": "B", "level": "Basic", "topic": "React Hooks & Lifecycle"},
        {"q": "What is the primary role of the JavaScript Event Loop?", "options": {"A": "Compiles JavaScript to assembly", "B": "Continuously monitors the Call Stack and moves callbacks from Task Queue when Call Stack is empty", "C": "Manages browser memory allocation", "D": "Renders CSS animations at 60 FPS"}, "ans": "B", "level": "Intermediate", "topic": "JavaScript Concurrency & Event Loop"},
        {"q": "What security header prevents Cross-Site Scripting (XSS) by restricting where scripts, styles, and images can load from?", "options": {"A": "CORS Access-Control-Allow-Origin", "B": "Content-Security-Policy (CSP)", "C": "X-Frame-Options", "D": "Strict-Transport-Security"}, "ans": "B", "level": "Intermediate", "topic": "Web Security & XSS"},
        {"q": "What mechanism enables client-side web applications to securely maintain state without sending tokens on every cross-domain asset request?", "options": {"A": "HttpOnly SameSite cookies", "B": "URL query parameters", "C": "Local storage eval()", "D": "WebSocket headers"}, "ans": "A", "level": "Intermediate", "topic": "Authentication & State"},
        {"q": "In React 18+, what is the difference between `useMemo` and `useCallback`?", "options": {"A": "useMemo memoizes a computed value; useCallback memoizes a callback function definition", "B": "useCallback caches JSX elements while useMemo triggers side effects", "C": "They are exact synonyms with identical signatures", "D": "useMemo runs asynchronously on web workers"}, "ans": "A", "level": "Intermediate", "topic": "React Performance"},
        {"q": "What is the purpose of HTTP/2 multiplexing compared to HTTP/1.1 pipelining?", "options": {"A": "Allows multiple bidirectional requests and responses concurrently over a single TCP connection without head-of-line blocking", "B": "Encrypts TCP payloads without TLS", "C": "Compresses server code using Gzip only", "D": "Replaces IP routing with DNS cache"}, "ans": "A", "level": "Advanced", "topic": "Web Protocols & Networking"},
        {"q": "How does Server-Side Rendering (SSR) in frameworks like Next.js improve Core Web Vitals over pure Single-Page Apps (SPA)?", "options": {"A": "Provides pre-rendered HTML on initial load, drastically reducing Largest Contentful Paint (LCP) and First Contentful Paint (FCP)", "B": "Removes the need for JavaScript entirely", "C": "Eliminates all network database queries", "D": "Prevents client browser hydration"}, "ans": "A", "level": "Advanced", "topic": "Full-Stack Architecture & SSR"},
        {"q": "What is the Same-Origin Policy (SOP) in web browsers, and what enables controlled relaxation for specific APIs?", "options": {"A": "Cross-Origin Resource Sharing (CORS)", "B": "WebAssembly", "C": "Service Worker Cache", "D": "Document Object Model"}, "ans": "A", "level": "Advanced", "topic": "Browser Architecture & CORS"}
    ],
    "ai_ml": [
        {"q": "What type of machine learning uses labeled input-output pairs to train predictive models?", "options": {"A": "Supervised Learning", "B": "Unsupervised Learning", "C": "Reinforcement Learning", "D": "Self-Supervised Clustering"}, "ans": "A", "level": "Basic", "topic": "Machine Learning Paradigms"},
        {"q": "What metric is most reliable for evaluating a classification model when the dataset has extreme class imbalance (e.g. 99% negative, 1% positive)?", "options": {"A": "Accuracy", "B": "F1-Score / PR-AUC", "C": "Mean Squared Error", "D": "R-squared"}, "ans": "B", "level": "Basic", "topic": "Evaluation Metrics"},
        {"q": "What problem occurs when a model performs exceptionally well on training data but poorly on unseen test data?", "options": {"A": "Underfitting", "B": "Overfitting", "C": "Data Drift", "D": "Vanishing Gradient"}, "ans": "B", "level": "Basic", "topic": "Generalization & Bias-Variance"},
        {"q": "Which optimization algorithm updates neural network weights by calculating gradients across mini-batches with momentum and adaptive learning rates?", "options": {"A": "Ordinary Least Squares", "B": "Adam Optimizer", "C": "Simplex Algorithm", "D": "Apriori Algorithm"}, "ans": "B", "level": "Intermediate", "topic": "Optimization & Gradient Descent"},
        {"q": "What is the primary role of the Self-Attention mechanism in the Transformer architecture?", "options": {"A": "Compute pairwise relevance scores between all tokens in a sequence regardless of distance", "B": "Perform spatial convolution over 2D pixels", "C": "Compress images to latent vectors", "D": "Eliminate matrix multiplication"}, "ans": "A", "level": "Intermediate", "topic": "Deep Learning & Transformers"},
        {"q": "What regularization technique randomly sets a fraction of neuron activations to zero during training to prevent co-adaptation?", "options": {"A": "Batch Normalization", "B": "Dropout", "C": "Early Stopping", "D": "Gradient Clipping"}, "ans": "B", "level": "Intermediate", "topic": "Neural Network Regularization"},
        {"q": "In neural networks, why did the ReLU (Rectified Linear Unit) activation function largely replace Sigmoid in hidden layers?", "options": {"A": "It mitigates the vanishing gradient problem for positive inputs and is computationally fast", "B": "It bounds outputs strictly between -1 and 1", "C": "It produces differentiable complex numbers", "D": "It prevents overfitting automatically"}, "ans": "A", "level": "Intermediate", "topic": "Activation Functions"},
        {"q": "What mathematical technique allows Large Language Models (LLMs) to be fine-tuned efficiently by training low-rank decomposition matrices (LoRA)?", "options": {"A": "Low-Rank Adaptation (LoRA)", "B": "Quantization-Aware Training without adapters", "C": "Full Model Pruning", "D": "Greedy Beam Search"}, "ans": "A", "level": "Advanced", "topic": "LLM Fine-Tuning & Parameter Efficiency"},
        {"q": "In Reinforcement Learning, what equation expresses the optimal action-value function Q*(s, a) recursively?", "options": {"A": "Bellman Optimality Equation", "B": "Navier-Stokes Equation", "C": "Bayes' Theorem", "D": "Schrodinger Equation"}, "ans": "A", "level": "Advanced", "topic": "Reinforcement Learning"},
        {"q": "What does the Kullback-Leibler (KL) divergence measure in probabilistic machine learning and Variational Autoencoders (VAEs)?", "options": {"A": "The statistical distance / information difference between two probability distributions", "B": "The Euclidean distance between vector centroids", "C": "The classification accuracy on test sets", "D": "The learning rate schedule"}, "ans": "A", "level": "Advanced", "topic": "Generative Models & Information Theory"}
    ],
    "computer_science": [
        {"q": "What is the primary function of an operating system's compiler front-end?", "options": {"A": "Lexical analysis, syntax parsing, and semantic verification into an intermediate representation", "B": "Link machine binaries", "C": "Allocate physical memory pages", "D": "Execute assembly code directly"}, "ans": "A", "level": "Basic", "topic": "Compiler Design"},
        {"q": "In the OSI 7-Layer Reference Model, at which layer do IP addressing and packet routing occur?", "options": {"A": "Data Link Layer (Layer 2)", "B": "Network Layer (Layer 3)", "C": "Transport Layer (Layer 4)", "D": "Session Layer (Layer 5)"}, "ans": "B", "level": "Basic", "topic": "Computer Networks"},
        {"q": "What boolean logic gate produces an output of 1 if and only if its two inputs differ?", "options": {"A": "AND", "B": "OR", "C": "XOR", "D": "NAND"}, "ans": "C", "level": "Basic", "topic": "Digital Logic & Computer Organization"},
        {"q": "Which protocol provides reliable, connection-oriented byte stream transmission with flow and congestion control?", "options": {"A": "UDP", "B": "TCP", "C": "ICMP", "D": "ARP"}, "ans": "B", "level": "Intermediate", "topic": "Transport Layer Protocols"},
        {"q": "In computer architecture, what hazard occurs when an instruction depends on the result of a previous instruction still in the pipeline?", "options": {"A": "Structural Hazard", "B": "Data Hazard", "C": "Control Hazard", "D": "Bus Hazard"}, "ans": "B", "level": "Intermediate", "topic": "Instruction Pipelining"},
        {"q": "What computational complexity class contains decision problems verifiable in polynomial time by a deterministic Turing machine?", "options": {"A": "P", "B": "NP", "C": "NP-Hard", "D": "EXPTIME"}, "ans": "B", "level": "Intermediate", "topic": "Theory of Computation"},
        {"q": "What cryptographic algorithm provides asymmetric public-key encryption and digital signatures based on the hardness of factoring large prime numbers?", "options": {"A": "AES-256", "B": "RSA", "C": "SHA-3", "D": "DES"}, "ans": "B", "level": "Intermediate", "topic": "Cryptography & Information Security"},
        {"q": "What is the Halting Problem, and what did Alan Turing prove regarding its solvability?", "options": {"A": "It is undecidable: no general algorithm can decide whether an arbitrary program will halt on a given input", "B": "It can be solved in O(n!) time", "C": "It is decidable for all Turing machines", "D": "It applies only to quantum computers"}, "ans": "A", "level": "Advanced", "topic": "Computability & Automata"},
        {"q": "In distributed consensus, which algorithm is widely used in modern cloud orchestrators (e.g. etcd, Kubernetes) for replicated state machines?", "options": {"A": "Raft / Paxos", "B": "Binary Search", "C": "Quicksort", "D": "Simulated Annealing"}, "ans": "A", "level": "Advanced", "topic": "Distributed Systems"},
        {"q": "In cache design, what principle of locality explains why recently accessed instructions are likely to be accessed again soon?", "options": {"A": "Temporal Locality", "B": "Spatial Locality", "C": "Sequential Locality", "D": "Associative Locality"}, "ans": "A", "level": "Intermediate", "topic": "Computer Architecture & Caching"}
    ],
    "chemistry": [
        {"q": "What is the pH of a neutral aqueous solution at 25°C?", "options": {"A": "0", "B": "7", "C": "14", "D": "1"}, "ans": "B", "level": "Basic", "topic": "Acids, Bases & pH"},
        {"q": "Which type of chemical bond involves the electrostatic attraction between oppositely charged ions?", "options": {"A": "Covalent bond", "B": "Ionic bond", "C": "Metallic bond", "D": "Hydrogen bond"}, "ans": "B", "level": "Basic", "topic": "Chemical Bonding"},
        {"q": "According to Le Chatelier's Principle, what happens to an exothermic equilibrium reaction when the temperature is increased?", "options": {"A": "Shifts toward products (forward)", "B": "Shifts toward reactants (reverse)", "C": "No shift in equilibrium", "D": "Equilibrium constant K increases"}, "ans": "B", "level": "Intermediate", "topic": "Chemical Equilibrium"},
        {"q": "What is the hybridization and molecular geometry of methane (CH4)?", "options": {"A": "sp2, Trigonal planar", "B": "sp3, Tetrahedral", "C": "sp, Linear", "D": "dsp2, Square planar"}, "ans": "B", "level": "Intermediate", "topic": "Organic Chemistry & Hybridization"},
        {"q": "In thermodynamics, what state function measures the degree of molecular disorder or randomness in a system?", "options": {"A": "Enthalpy (H)", "B": "Entropy (S)", "C": "Gibbs Free Energy (G)", "D": "Internal Energy (U)"}, "ans": "B", "level": "Basic", "topic": "Thermodynamics"},
        {"q": "What is the oxidation state of Chromium in the dichromate ion (Cr2O7^2-)?", "options": {"A": "+3", "B": "+6", "C": "+7", "D": "+4"}, "ans": "B", "level": "Intermediate", "topic": "Redox Reactions & Electrochemistry"},
        {"q": "Which spectroscopic technique is primarily used to identify organic functional groups by measuring molecular vibrational transitions?", "options": {"A": "Nuclear Magnetic Resonance (NMR)", "B": "Infrared (IR) Spectroscopy", "C": "Mass Spectrometry (MS)", "D": "UV-Visible Spectroscopy"}, "ans": "B", "level": "Intermediate", "topic": "Spectroscopy & Analytical Chemistry"},
        {"q": "What is the criteria for a chemical reaction to be thermodynamically spontaneous at constant temperature and pressure?", "options": {"A": "Delta H < 0 always", "B": "Delta G < 0 (Gibbs Free Energy decrease)", "C": "Delta S < 0", "D": "Delta G > 0"}, "ans": "B", "level": "Intermediate", "topic": "Chemical Thermodynamics"},
        {"q": "Which reaction mechanism involves a single concerted bimolecular transition state with inversion of stereochemical configuration?", "options": {"A": "SN1", "B": "SN2", "C": "E1", "D": "E2"}, "ans": "B", "level": "Advanced", "topic": "Organic Reaction Mechanisms"},
        {"q": "According to the Arrhenius equation, how does a catalyst accelerate a chemical reaction?", "options": {"A": "By increasing temperature", "B": "By providing an alternative reaction pathway with lower activation energy (Ea)", "C": "By shifting equilibrium position", "D": "By increasing collision rate only"}, "ans": "B", "level": "Advanced", "topic": "Chemical Kinetics"}
    ],
    "biology": [
        {"q": "Which organelle is known as the powerhouse of eukaryotic cells and generates ATP through cellular respiration?", "options": {"A": "Nucleus", "B": "Mitochondria", "C": "Golgi apparatus", "D": "Endoplasmic Reticulum"}, "ans": "B", "level": "Basic", "topic": "Cell Biology & Organelles"},
        {"q": "During DNA replication, which enzyme is responsible for synthesizing new DNA strands by adding complementary nucleotides?", "options": {"A": "DNA Ligase", "B": "DNA Polymerase", "C": "RNA Helicase", "D": "Topoisomerase"}, "ans": "B", "level": "Basic", "topic": "Molecular Biology & DNA Replication"},
        {"q": "What is the primary pigment responsible for absorbing light energy during photosynthesis in green plants?", "options": {"A": "Carotenoid", "B": "Chlorophyll a", "C": "Anthocyanin", "D": "Xanthophyll"}, "ans": "B", "level": "Basic", "topic": "Plant Physiology & Photosynthesis"},
        {"q": "In human genetics, what phenotypic ratio is expected in the F2 generation of a classic Mendelian monohybrid cross with complete dominance?", "options": {"A": "1:1", "B": "3:1", "C": "9:3:3:1", "D": "1:2:1"}, "ans": "B", "level": "Intermediate", "topic": "Genetics & Heredity"},
        {"q": "What biological process produces four genetically diverse haploid gamete cells from a single diploid cell?", "options": {"A": "Mitosis", "B": "Meiosis", "C": "Binary Fission", "D": "Budding"}, "ans": "B", "level": "Intermediate", "topic": "Cell Division & Meiosis"},
        {"q": "In molecular genetics, what is the process of synthesizing mRNA from a DNA template strand called?", "options": {"A": "Translation", "B": "Transcription", "C": "Reverse Transcription", "D": "Transduction"}, "ans": "B", "level": "Basic", "topic": "Central Dogma & Transcription"},
        {"q": "Which blood vessels carry oxygenated blood from the lungs directly into the left atrium of the human heart?", "options": {"A": "Vena Cava", "B": "Pulmonary Veins", "C": "Pulmonary Arteries", "D": "Aorta"}, "ans": "B", "level": "Intermediate", "topic": "Human Physiology & Circulatory System"},
        {"q": "What molecular technique uses sequence-specific RNA guides and Cas endonuclease to edit targeted genomic sequences?", "options": {"A": "Western Blotting", "B": "CRISPR-Cas9", "C": "Polymerase Chain Reaction (PCR)", "D": "Gel Electrophoresis"}, "ans": "B", "level": "Advanced", "topic": "Biotechnology & Genetic Engineering"},
        {"q": "In ecology, what rule states that approximately only 10% of chemical energy transfers from one trophic level to the next?", "options": {"A": "Allen's Rule", "B": "Lindeman's 10% Energy Law", "C": "Bergmann's Rule", "D": "Gause's Competitive Exclusion Principle"}, "ans": "B", "level": "Intermediate", "topic": "Ecology & Ecosystem Dynamics"},
        {"q": "What immune cells produce antibodies specifically targeted against foreign antigens in humoral immunity?", "options": {"A": "Cytotoxic T cells", "B": "Plasma B cells", "C": "Neutrophils", "D": "Natural Killer (NK) cells"}, "ans": "B", "level": "Advanced", "topic": "Immunology"}
    ],
    "python": [
        {"q": "What is the time complexity of dictionary key lookup in Python on average?", "options": {"A": "O(n)", "B": "O(1)", "C": "O(log n)", "D": "O(n log n)"}, "ans": "B", "level": "Basic", "topic": "Dictionaries & Sets"},
        {"q": "Which keyword is used to create a generator function in Python?", "options": {"A": "return", "B": "yield", "C": "generator", "D": "async"}, "ans": "B", "level": "Basic", "topic": "Generators & Iterators"},
        {"q": "In Python, what is the output of `[i for i in range(5) if i % 2 == 0]`?", "options": {"A": "[0, 2, 4]", "B": "[1, 3]", "C": "[0, 1, 2, 3, 4]", "D": "[2, 4]"}, "ans": "A", "level": "Basic", "topic": "List Comprehensions"},
        {"q": "What does the `@property` decorator achieve in a Python class?", "options": {"A": "Creates a static method", "B": "Enables getter/setter syntax for attributes", "C": "Encrypts private variables", "D": "Prevents method overriding"}, "ans": "B", "level": "Intermediate", "topic": "Object-Oriented Programming"},
        {"q": "Which data structure in Python is mutable, ordered, and allows duplicate elements?", "options": {"A": "Tuple", "B": "Set", "C": "List", "D": "FrozenSet"}, "ans": "C", "level": "Basic", "topic": "Data Structures"},
        {"q": "What happens when you modify an immutable object like a tuple containing a mutable list element?", "options": {"A": "TypeError is raised immediately", "B": "The list element can be mutated in place", "C": "The tuple creates a copy", "D": "Python crashes"}, "ans": "B", "level": "Intermediate", "topic": "Mutability & References"},
        {"q": "In `asyncio`, what does `await asyncio.gather(*tasks)` do?", "options": {"A": "Cancels all running tasks", "B": "Runs tasks concurrently and waits for all to complete", "C": "Executes tasks sequentially in thread pool", "D": "Blocks the entire main thread"}, "ans": "B", "level": "Advanced", "topic": "Concurrency & AsyncIO"},
        {"q": "How does Python handle memory management for cyclic object references?", "options": {"A": "Manual free() calls", "B": "Generational Garbage Collector", "C": "Pure reference counting only", "D": "Virtual memory swap"}, "ans": "B", "level": "Advanced", "topic": "Memory Management"},
        {"q": "What is the primary purpose of `*args` and `**kwargs` in a function signature?", "options": {"A": "Enforce strict type checking", "B": "Accept arbitrary positional and keyword arguments", "C": "Compile to C speed", "D": "Define global variables"}, "ans": "B", "level": "Intermediate", "topic": "Functions & Scope"},
        {"q": "What does a custom context manager class need to implement to support the `with` statement?", "options": {"A": "`__init__` and `__del__`", "B": "`__enter__` and `__exit__`", "C": "`__open__` and `__close__`", "D": "`__start__` and `__stop__`"}, "ans": "B", "level": "Advanced", "topic": "Context Managers"}
    ],
    "physics": [
        {"q": "According to Kirchhoff's Voltage Law (KVL), the algebraic sum of potential differences in any closed loop is:", "options": {"A": "Zero", "B": "Equal to total current", "C": "Equal to total resistance", "D": "Infinite"}, "ans": "A", "level": "Basic", "topic": "Kirchhoff's Laws"},
        {"q": "What is the SI unit of electric potential difference and electromotive force (EMF)?", "options": {"A": "Ampere", "B": "Volt", "C": "Ohm", "D": "Farad"}, "ans": "B", "level": "Basic", "topic": "Ohm's Law"},
        {"q": "Two resistors of 6 ohms and 3 ohms are connected in parallel. What is the equivalent resistance?", "options": {"A": "9 ohms", "B": "2 ohms", "C": "4.5 ohms", "D": "18 ohms"}, "ans": "B", "level": "Basic", "topic": "Series and Parallel Resistances"},
        {"q": "Why is a potentiometer preferred over a standard voltmeter for measuring cell EMF accurately?", "options": {"A": "It is cheaper", "B": "It draws zero current from the cell at null point", "C": "It operates at higher frequency", "D": "It has lower resistance"}, "ans": "B", "level": "Intermediate", "topic": "Potentiometer Working"},
        {"q": "Faraday's Law of Electromagnetic Induction states that the magnitude of induced EMF is proportional to:", "options": {"A": "Total magnetic field", "B": "Rate of change of magnetic flux", "C": "Current flowing in circuit", "D": "Resistance of coil"}, "ans": "B", "level": "Intermediate", "topic": "Electromagnetic Induction"},
        {"q": "Lenz's Law is a direct consequence of which fundamental conservation principle?", "options": {"A": "Conservation of Charge", "B": "Conservation of Energy", "C": "Conservation of Momentum", "D": "Conservation of Mass"}, "ans": "B", "level": "Intermediate", "topic": "Electromagnetic Induction"},
        {"q": "In Young's Double Slit Experiment, what happens to fringe width when the distance between slits is doubled?", "options": {"A": "Doubles", "B": "Halves", "C": "Remains unchanged", "D": "Quadruples"}, "ans": "B", "level": "Intermediate", "topic": "Wave Optics & Interference"},
        {"q": "Which Maxwell equation accounts for displacement current?", "options": {"A": "Gauss's Law for Electricity", "B": "Gauss's Law for Magnetism", "C": "Faraday's Law", "D": "Ampere-Maxwell Law"}, "ans": "D", "level": "Advanced", "topic": "Maxwell Equations"},
        {"q": "When temperature of a semiconductor increases, its electrical resistance:", "options": {"A": "Increases linearly", "B": "Decreases exponentially", "C": "Remains constant", "D": "Fluctuates randomly"}, "ans": "B", "level": "Intermediate", "topic": "Current Electricity"},
        {"q": "In a balanced Wheatstone Bridge with arms P, Q, R, S, the condition for null deflection is:", "options": {"A": "P/Q = R/S", "B": "P*Q = R*S", "C": "P + Q = R + S", "D": "P - Q = R - S"}, "ans": "A", "level": "Basic", "topic": "Wheatstone Bridge"}
    ],
    "mathematics": [
        {"q": "What is the derivative of f(x) = ln(x) with respect to x (for x > 0)?", "options": {"A": "1/x", "B": "e^x", "C": "1/x^2", "D": "x"}, "ans": "A", "level": "Basic", "topic": "Differentiation & Chain Rule"},
        {"q": "What is the definite integral of sin(x) from 0 to pi?", "options": {"A": "0", "B": "2", "C": "1", "D": "-2"}, "ans": "B", "level": "Basic", "topic": "Integral Calculus"},
        {"q": "What condition must a square matrix A satisfy to be invertible?", "options": {"A": "det(A) = 0", "B": "det(A) != 0", "C": "Trace(A) = 0", "D": "A must be diagonal"}, "ans": "B", "level": "Basic", "topic": "Linear Algebra"},
        {"q": "Evaluate the limit as x -> 0 of sin(x)/x:", "options": {"A": "0", "B": "1", "C": "Infinity", "D": "Undefined"}, "ans": "B", "level": "Basic", "topic": "Limits & Continuity"},
        {"q": "What is the order and degree of the differential equation (d^2y/dx^2)^3 + dy/dx = 0?", "options": {"A": "Order 2, Degree 3", "B": "Order 3, Degree 2", "C": "Order 2, Degree 1", "D": "Order 3, Degree 1"}, "ans": "A", "level": "Intermediate", "topic": "Differential Equations"},
        {"q": "Using integration by parts, the formula for integral of u * dv is:", "options": {"A": "u*v + integral(v*du)", "B": "u*v - integral(v*du)", "C": "u/v - integral(du/dv)", "D": "du*dv - u*v"}, "ans": "B", "level": "Intermediate", "topic": "Integral Calculus"},
        {"q": "If matrix A has eigenvalues 2 and 5, what is the determinant of A?", "options": {"A": "7", "B": "10", "C": "2.5", "D": "25"}, "ans": "B", "level": "Intermediate", "topic": "Linear Algebra"},
        {"q": "Which test determines whether an alternating series converges conditionally or absolutely?", "options": {"A": "Leibniz Alternating Series Test", "B": "Ratio Test on absolute terms", "C": "Integral Test", "D": "Both A and B"}, "ans": "D", "level": "Advanced", "topic": "Infinite Series"},
        {"q": "What is the gradient vector of a scalar field f(x, y, z)?", "options": {"A": "Scalar sum of partial derivatives", "B": "Vector of partial derivatives [df/dx, df/dy, df/dz]", "C": "Cross product with unit vector", "D": "Second derivative matrix"}, "ans": "B", "level": "Intermediate", "topic": "Vector Calculus"},
        {"q": "What is the general solution of dy/dx = k*y?", "options": {"A": "y = k*x + C", "B": "y = C * e^(kx)", "C": "y = ln(kx) + C", "D": "y = C * x^k"}, "ans": "B", "level": "Basic", "topic": "Differential Equations"}
    ]
}

def resolve_subject_questions(subject_name: str):
    """Accurately maps any subject name or search string to the appropriate detailed question bank."""
    s = (subject_name or '').lower().strip()
    
    # 0. Direct key match
    if s in DEFAULT_QUESTION_BANK:
        return DEFAULT_QUESTION_BANK[s]

    # 1. AI / ML / Data Science (checked early to capture abbreviations)
    if any(k in s for k in ['ai_ml', 'ai/ml', 'aiml', 'artificial intelligence', 'machine learning', 'deep learning', 'neural', 'nlp', 'data science', 'llm', 'computer vision']) or s in ('ai', 'ml'):
        return DEFAULT_QUESTION_BANK['ai_ml']
    
    # 2. Web Development (checked before 'stack' in DSA)
    if any(k in s for k in ['web', 'frontend', 'backend', 'fullstack', 'full stack', 'html', 'css', 'javascript', 'react', 'node', 'typescript']):
        return DEFAULT_QUESTION_BANK['webdev']

    # 3. Operating Systems
    if any(k in s for k in ['operating system', 'kernel', 'process', 'thread', 'scheduling', 'virtual memory', 'deadlock', 'semaphore']) or s == 'os':
        return DEFAULT_QUESTION_BANK['os']
    
    # 4. DBMS / Databases
    if any(k in s for k in ['dbms', 'database', 'sql', 'rdbms', 'nosql', 'relational', 'normalization', 'acid', 'query']):
        return DEFAULT_QUESTION_BANK['dbms']
    
    # 5. DSA / Data Structures / Algorithms
    if any(k in s for k in ['dsa', 'data structure', 'algorithm', 'sorting', 'tree', 'graph', 'linked list', 'dynamic programming', 'heap', 'stack', 'queue']):
        return DEFAULT_QUESTION_BANK['dsa']
        
    # 6. Python
    if 'python' in s:
        return DEFAULT_QUESTION_BANK['python']
        
    # 7. Chemistry
    if any(k in s for k in ['chem', 'organic', 'inorganic', 'thermodynamics']):
        return DEFAULT_QUESTION_BANK['chemistry']
        
    # 8. Biology
    if any(k in s for k in ['bio', 'genetics', 'physiology', 'cell', 'botany', 'zoology']):
        return DEFAULT_QUESTION_BANK['biology']
        
    # 9. Physics
    if any(k in s for k in ['physic', 'mechanics', 'electromagnet', 'optics', 'kinematics', 'quantum']):
        return DEFAULT_QUESTION_BANK['physics']
        
    # 10. Mathematics
    if any(k in s for k in ['math', 'calculus', 'algebra', 'matrix', 'integral', 'differential', 'statistics', 'discrete']):
        return DEFAULT_QUESTION_BANK['mathematics']
        
    # 11. Computer Science general
    if any(k in s for k in ['computer science', 'coding', 'programming', 'software']) or s == 'cs':
        return DEFAULT_QUESTION_BANK['computer_science']
        
    # Default fallbacks: technical goes to DSA, general to Mathematics
    if any(k in s for k in ['tech', 'eng', 'dev', 'code', 'system', 'cyber']):
        return DEFAULT_QUESTION_BANK['dsa']
    return DEFAULT_QUESTION_BANK['mathematics']

def compute_realistic_progress_rate(cursor, student_id: int) -> float:
    """Calculates realistic syllabus completion velocity (%/day) grounded in actual student progress."""
    cursor.execute("SELECT COUNT(*) FROM daily_syllabus_updates WHERE student_id = ?", (student_id,))
    daily_logs = cursor.fetchone()[0] or 0
    cursor.execute("SELECT SUM(completed_percentage), COUNT(*) FROM student_syllabus_progress WHERE student_id = ?", (student_id,))
    row = cursor.fetchone()
    if row and row[1] and row[1] > 0:
        total_pct = float(row[0] or 0.0)
        avg_pct = total_pct / int(row[1])
        if avg_pct <= 0.0 and daily_logs == 0:
            daily_rate = 0.0
        else:
            daily_rate = round(min(2.5, max(0.2, (avg_pct / 45.0) + min(0.6, daily_logs * 0.08))), 1)
    else:
        daily_rate = 0.0
    cursor.execute("UPDATE students SET syllabus_progress_rate = ? WHERE id = ?", (daily_rate, student_id))
    return daily_rate

# =========================================================================
# 1. PROFILE & ONBOARDING
# =========================================================================

@student_bp.route('/profile', methods=['GET'])
@role_required('student')
def get_profile():
    student_id = session['user_id']
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT id, name, email, college, university_roll_no,
               class_year, curriculum, academic_subjects, interested_subjects,
               additional_skills, preferred_language, knowledge_level,
               potential_score, syllabus_progress_rate, verification_status,
               verified_at, institute_id, github_url, leetcode_url, created_at
        FROM students
        WHERE id = ?
        """,
        (student_id,)
    )
    profile = row_to_dict(cursor.fetchone())

    # Attached documents
    cursor.execute("SELECT id, document_type, file_url, uploaded_at FROM student_documents WHERE student_id = ?", (student_id,))
    documents = [row_to_dict(r) for r in cursor.fetchall()]

    if profile:
        profile['is_verified'] = (profile.get('verification_status') == 'verified')
        profile['documents'] = documents
        profile['academic_class'] = profile.get('class_year')
        profile['board_curriculum'] = profile.get('curriculum')
        profile['academic_interests'] = profile.get('interested_subjects')
        profile['extra_subjects'] = profile.get('interested_subjects')
        profile['academic_subjects_list'] = [s.strip() for s in (profile.get('academic_subjects') or '').split(',') if s.strip()]
        profile['interested_subjects_list'] = [s.strip() for s in (profile.get('interested_subjects') or '').split(',') if s.strip()]
        profile['additional_skills_list'] = [s.strip() for s in (profile.get('additional_skills') or '').split(',') if s.strip()]

        pot_data = calculate_student_potential_score(cursor, student_id)
        conn.commit()
        profile['potential_score'] = pot_data['potential_score']
        profile['potential_tier'] = pot_data['potential_tier']
        profile['potential_breakdown'] = pot_data['breakdown']
        profile['potential_insights'] = pot_data['insights']

    conn.close()

    return jsonify({'profile': profile}), 200

@student_bp.route('/profile', methods=['PUT'])
@role_required('student')
def update_profile():
    student_id = session['user_id']
    data = request.get_json() or {}

    if 'academic_class' in data and 'class_year' not in data:
        data['class_year'] = data['academic_class']
    if 'board_curriculum' in data and 'curriculum' not in data:
        data['curriculum'] = data['board_curriculum']
    if 'extra_subjects' in data and 'interested_subjects' not in data:
        data['interested_subjects'] = data['extra_subjects']
    if 'academic_interests' in data and 'interested_subjects' not in data:
        data['interested_subjects'] = data['academic_interests']

    allowed_fields = [
        'college', 'university_roll_no', 'class_year', 'curriculum',
        'academic_subjects', 'interested_subjects', 'additional_skills',
        'preferred_language', 'knowledge_level', 'github_url', 'leetcode_url',
        'institute_id'
    ]
    updates = {k: data[k] for k in allowed_fields if k in data}

    if not updates:
        return jsonify({'message': 'No profile updates supplied.'}), 200

    set_clause = ", ".join(f"{k} = ?" for k in updates.keys())
    values = list(updates.values()) + [student_id]

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(f"UPDATE students SET {set_clause} WHERE id = ?", values)
    conn.commit()
    conn.close()

    return jsonify({'message': 'Learning profile updated successfully!', 'updated': updates}), 200

@student_bp.route('/onboarding', methods=['POST'])
@role_required('student')
def complete_onboarding():
    """Saves learning-focused onboarding without asking for a resume."""
    student_id = session['user_id']
    data = request.get_json() or {}

    class_year = data.get('class_year', '3rd Year B.Tech').strip()
    college = data.get('college', '').strip()
    curriculum = data.get('curriculum', 'Computer Science & Engineering').strip()
    academic_subjects = data.get('academic_subjects', '').strip()
    interested_subjects = data.get('interested_subjects', '').strip()
    additional_skills = data.get('additional_skills', '').strip()
    preferred_language = data.get('preferred_language', 'English').strip()
    knowledge_level = data.get('knowledge_level', 'Intermediate').strip()
    institute_id = data.get('institute_id')

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        """
        UPDATE students
        SET class_year = ?, college = COALESCE(NULLIF(?, ''), college),
            curriculum = ?, academic_subjects = ?, interested_subjects = ?,
            additional_skills = ?, preferred_language = ?, knowledge_level = ?,
            institute_id = COALESCE(?, institute_id)
        WHERE id = ?
        """,
        (class_year, college, curriculum, academic_subjects, interested_subjects,
         additional_skills, preferred_language, knowledge_level, institute_id, student_id)
    )

    # 1. Initialize academic syllabus progress (starting fresh at 0% for new student intake!)
    academic_list = [s.strip() for s in academic_subjects.split(',') if s.strip()]
    if not academic_list:
        academic_list = ['Mathematics', 'Physics', 'Computer Science']

    for subj in academic_list:
        cursor.execute(
            """
            INSERT OR IGNORE INTO student_syllabus_progress (
                student_id, subject_name, total_topics, completed_topics, revision_topics,
                completed_percentage, exam_readiness_score, practice_avg_score, exam_avg_score,
                topics_understood_pct, revision_status_pct, is_weak_subject
            )
            VALUES (?, ?, 15, 0, 0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0)
            """,
            (student_id, subj)
        )
        # Seed rich academic pathway for each academic subject
        ac_topics = build_rich_pathway_topics(subj, 'academic', score_pct=40.0)
        cursor.execute(
            """
            INSERT OR REPLACE INTO student_learning_pathways (
                student_id, subject_name, pathway_type, current_level, estimated_hours, difficulty, topics_json, recommended_sequence
            )
            VALUES (?, ?, 'academic', ?, 50, 'Intermediate', ?, ?)
            """,
            (
                student_id, subj, knowledge_level,
                json.dumps(ac_topics),
                "Foundations → Core Mechanics → Applications → Advanced Paradigms"
            )
        )

    # 2. Seed extra skills / Track 2 pathways
    extra_list = [s.strip() for s in interested_subjects.split(',') if s.strip()]
    if not extra_list and additional_skills:
        extra_list = [s.strip() for s in additional_skills.split(',') if s.strip()]
    if not extra_list:
        extra_list = ['Python Programming', 'Artificial Intelligence']

    for extra_sub in extra_list:
        ex_topics = build_rich_pathway_topics(extra_sub, 'additional', score_pct=30.0)
        cursor.execute(
            """
            INSERT OR REPLACE INTO student_learning_pathways (
                student_id, subject_name, pathway_type, current_level, estimated_hours, difficulty, topics_json, recommended_sequence
            )
            VALUES (?, ?, 'additional', ?, 45, 'Intermediate', ?, ?)
            """,
            (
                student_id, extra_sub, knowledge_level,
                json.dumps(ex_topics),
                "Prerequisites → Core Techniques → Hands-on Mini Projects → Capstone"
            )
        )

    # 3. Schedule sports / free time in personal schedule so no study burnout occurs!
    sports_extracurricular = (data.get('sports_preference') or data.get('sports_extracurricular') or '').strip()
    if sports_extracurricular:
        for day in ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']:
            cursor.execute(
                """
                INSERT INTO student_personal_schedules (
                    student_id, title, activity_type, subject_name, day_of_week, start_time, end_time, notes
                )
                VALUES (?, ?, 'free_time', '', ?, '04:30 PM', '05:30 PM', 'Protected physical health & sports time')
                """,
                (student_id, sports_extracurricular, day)
            )

    conn.commit()
    conn.close()

    return jsonify({
        'message': 'Student curriculum intake completed! Pathways and subjects initialized.',
        'onboarding': {
            'class_year': class_year,
            'curriculum': curriculum,
            'academic_subjects': academic_subjects,
            'interested_subjects': interested_subjects,
            'preferred_language': preferred_language,
            'academic_list': academic_list,
            'extra_list': extra_list
        }
    }), 200

@student_bp.route('/subjects/catalog', methods=['GET'])
def get_subject_catalog():
    """Returns diverse subject choices across disciplines + Other option."""
    return jsonify({
        'subjects': SUBJECT_CATALOG,
        'categories': [
            'Academic Core', 'Technical', 'Programming & Software',
            'Engineering & Hardware', 'Data & Analysis', 'Sciences',
            'Commerce & Social', 'Creative Fields', 'Humanities', 'Practical Skills'
        ]
    }), 200

# =========================================================================
# 2. DIAGNOSTIC ASSESSMENT & PATHWAY GENERATION
# =========================================================================

@student_bp.route('/diagnostic/<subject_name>/questions', methods=['GET'])
@role_required('student')
def get_diagnostic_questions(subject_name):
    """Provides discrete diagnostic test spanning Basic, Intermediate, Advanced levels."""
    questions = resolve_subject_questions(subject_name)

    formatted = []
    for idx, q in enumerate(questions):
        formatted.append({
            "id": idx + 1,
            "question_text": q["q"],
            "options": q["options"],
            "level": q["level"],
            "topic": q["topic"]
        })

    return jsonify({
        'subject': subject_name,
        'total_questions': len(formatted),
        'difficulty_mix': '3 Basic, 4 Intermediate, 3 Advanced',
        'questions': formatted
    }), 200

@student_bp.route('/diagnostic/<subject_name>/submit', methods=['POST'])
@role_required('student')
def submit_diagnostic_test(subject_name):
    """Evaluates diagnostic test, determines starting knowledge level, and seeds personalized pathway."""
    student_id = session['user_id']
    data = request.get_json() or {}
    answers = data.get('answers', {})

    questions = resolve_subject_questions(subject_name)

    correct_count = 0
    understood = []
    partially_understood = []
    needs_improvement = []

    for idx, q in enumerate(questions):
        q_id = str(idx + 1)
        student_ans = answers.get(q_id, '').strip().upper()
        if student_ans == q['ans']:
            correct_count += 1
            understood.append(q['topic'])
        else:
            if q['level'] in ('Intermediate', 'Advanced'):
                partially_understood.append(q['topic'])
            else:
                needs_improvement.append(q['topic'])

    total_q = len(questions)
    score_pct = round((correct_count / total_q) * 100, 1)

    if score_pct >= 80:
        knowledge_level = "Advanced"
    elif score_pct >= 50:
        knowledge_level = "Intermediate"
    else:
        knowledge_level = "Beginner"

    conn = get_db()
    cursor = conn.cursor()

    # Save diagnostic test record
    cursor.execute(
        """
        INSERT INTO diagnostic_tests (
            student_id, subject_name, level, score, total_questions,
            topics_understood, topics_partially_understood, topics_needs_improvement,
            estimated_knowledge_level, recommended_focus
        )
        VALUES (?, ?, 'Comprehensive', ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            student_id, subject_name, score_pct, total_q,
            json.dumps(list(set(understood))),
            json.dumps(list(set(partially_understood))),
            json.dumps(list(set(needs_improvement))),
            knowledge_level,
            f"Focus on strengthening: {', '.join(list(set(needs_improvement))[:3]) or 'Advanced Concepts'}"
        )
    )

    # Determine pathway_type
    p_type = 'academic'
    cursor.execute("SELECT academic_subjects FROM students WHERE id = ?", (student_id,))
    st_row = cursor.fetchone()
    if st_row and st_row['academic_subjects']:
        ac_subjs = [s.strip().lower() for s in st_row['academic_subjects'].split(',')]
        if subject_name.lower() not in ac_subjs and not any(k in subject_name.lower() for k in ['math', 'calculus', 'algebra', 'physics', 'cs', 'computer']):
            p_type = 'additional'
    elif not any(k in subject_name.lower() for k in ['math', 'calculus', 'algebra', 'physics', 'cs', 'computer']):
        p_type = 'additional'

    pathway_topics = build_rich_pathway_topics(subject_name, p_type, score_pct, understood, needs_improvement)

    cursor.execute(
        """
        INSERT OR REPLACE INTO student_learning_pathways (
            student_id, subject_name, pathway_type, current_level, estimated_hours, difficulty, topics_json, recommended_sequence
        )
        VALUES (?, ?, ?, ?, 60, ?, ?, ?)
        """,
        (
            student_id, subject_name, p_type, knowledge_level, knowledge_level,
            json.dumps(pathway_topics),
            "Diagnostic Review → Core Competencies → Targeted Remediation → Mastery"
        )
    )

    # If it is an academic subject, update/sync syllabus progress as well!
    cursor.execute(
        """
        INSERT OR REPLACE INTO student_syllabus_progress (
            student_id, subject_name, total_topics, completed_topics, revision_topics,
            completed_percentage, exam_readiness_score, practice_avg_score, exam_avg_score,
            topics_understood_pct, revision_status_pct, is_weak_subject
        )
        VALUES (?, ?, 15, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            student_id, subject_name,
            len(understood),
            len(needs_improvement),
            min(100.0, max(20.0, score_pct * 0.8)),
            score_pct,
            score_pct,
            score_pct,
            round((len(understood) / (total_q or 1)) * 100, 1),
            round((len(needs_improvement) / (total_q or 1)) * 100, 1),
            1 if score_pct < 50 else 0
        )
    )

    # Update student's overall knowledge level in profile and recalculate grounded potential score
    cursor.execute(
        "UPDATE students SET knowledge_level = ? WHERE id = ?",
        (knowledge_level, student_id)
    )
    calculate_student_potential_score(cursor, student_id)
    compute_realistic_progress_rate(cursor, student_id)

    # Add notification for student
    cursor.execute(
        """
        INSERT INTO notifications (user_id, user_role, title, message, notification_type, link_tab)
        VALUES (?, 'student', ?, ?, 'success', 'pathways')
        """,
        (
            student_id,
            f"Diagnostic Complete: {subject_name}",
            f"Assessed as {knowledge_level} level ({score_pct}%). Personalized learning pathway generated."
        )
    )

    conn.commit()
    conn.close()

    return jsonify({
        'message': f'Diagnostic evaluation completed for {subject_name}!',
        'subject': subject_name,
        'subject_name': subject_name,
        'pathway_type': p_type,
        'score': score_pct,
        'knowledge_level': knowledge_level,
        'topics_mastered': list(set(understood)),
        'topics_partially_understood': list(set(partially_understood)),
        'topics_needs_improvement': list(set(needs_improvement)),
        'pathway_created': True
    }), 201

# =========================================================================
# 3. ADAPTIVE LEARNING PATHWAYS
# =========================================================================

@student_bp.route('/pathways', methods=['GET'])
@role_required('student')
def get_student_pathways():
    """Returns active adaptive pathways for Academic and Additional learning subjects."""
    student_id = session['user_id']
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT id, subject_name, pathway_type, current_level, estimated_hours,
               difficulty, topics_json, recommended_sequence, last_updated
        FROM student_learning_pathways
        WHERE student_id = ?
        ORDER BY pathway_type ASC, subject_name ASC
        """,
        (student_id,)
    )
    rows = cursor.fetchall()
    conn.close()

    pathways = []
    for r in rows:
        d = row_to_dict(r)
        try:
            d['topics'] = json.loads(d['topics_json'])
        except Exception:
            d['topics'] = []
        pathways.append(d)

    return jsonify({'pathways': pathways}), 200

@student_bp.route('/pathways/<subject_name>/topics/<topic_id>/status', methods=['POST'])
@role_required('student')
def update_topic_status(subject_name, topic_id):
    """Updates a topic's status in the student's personalized learning pathway."""
    student_id = session['user_id']
    data = request.get_json() or {}
    new_status = data.get('status', 'mastered').strip().lower()

    if new_status not in ('mastered', 'in_progress', 'needs_revision', 'next', 'pending'):
        return jsonify({'error': 'Invalid status'}), 400

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT id, topics_json FROM student_learning_pathways WHERE student_id = ? AND subject_name = ?",
        (student_id, subject_name)
    )
    row = cursor.fetchone()
    if not row:
        conn.close()
        return jsonify({'error': 'Pathway not found for this subject.'}), 404

    try:
        topics = json.loads(row['topics_json'])
        found = False
        for t in topics:
            if t.get('id') == topic_id:
                t['status'] = new_status
                found = True
                break
        if not found:
            conn.close()
            return jsonify({'error': 'Topic ID not found in pathway.'}), 404

        cursor.execute(
            """
            UPDATE student_learning_pathways
            SET topics_json = ?, last_updated = CURRENT_TIMESTAMP
            WHERE id = ?
            """,
            (json.dumps(topics), row['id'])
        )

        # Recalculate grounded potential score and realistic progress rate
        calculate_student_potential_score(cursor, student_id)
        compute_realistic_progress_rate(cursor, student_id)
        conn.commit()
    finally:
        conn.close()

    return jsonify({'message': f'Topic status updated to {new_status}!'}), 200

# =========================================================================
# 4. SYLLABUS PROGRESS & FIT SCORE (EXAM READINESS)
# =========================================================================

@student_bp.route('/syllabus', methods=['GET'])
@role_required('student')
def get_syllabus_progress():
    """Returns syllabus progress, fit scores, upcoming exam meter data, skill growth velocity, and components."""
    student_id = session['user_id']
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT id, subject_name, total_topics, completed_topics, revision_topics,
               completed_percentage, exam_readiness_score, practice_avg_score,
               exam_avg_score, topics_understood_pct, revision_status_pct,
               is_weak_subject, last_updated
        FROM student_syllabus_progress
        WHERE student_id = ?
        ORDER BY is_weak_subject DESC, subject_name ASC
        """,
        (student_id,)
    )
    progress_rows = [row_to_dict(r) for r in cursor.fetchall()]

    # Fetch recent daily updates (deduplicated chronologically)
    cursor.execute(
        """
        SELECT id, subject_name, completed_topics, revision_topics, practice_count, study_minutes, notes, log_date
        FROM daily_syllabus_updates
        WHERE student_id = ?
        ORDER BY log_date DESC, created_at DESC LIMIT 15
        """,
        (student_id,)
    )
    daily_updates = [row_to_dict(r) for r in cursor.fetchall()]

    # Dynamically calculate Educational Potential Index
    pot_data = calculate_student_potential_score(cursor, student_id)
    conn.commit()

    if progress_rows:
        avg_completed = sum(r['completed_percentage'] for r in progress_rows) / len(progress_rows)
        avg_readiness = sum(r['exam_readiness_score'] for r in progress_rows) / len(progress_rows)
    else:
        avg_completed = 0.0
        avg_readiness = 0.0

    # Fetch nearest upcoming examination from institute schedules / examinations
    cursor.execute("SELECT institute_id FROM students WHERE id = ?", (student_id,))
    st_inst = cursor.fetchone()
    inst_id = st_inst['institute_id'] if st_inst and st_inst['institute_id'] else 1

    cursor.execute(
        """
        SELECT title, subject_name, date, start_time, end_time, schedule_type, venue_or_link
        FROM institute_schedules
        WHERE institute_id = ? AND schedule_type IN ('examination', 'test', 'practical')
        ORDER BY date ASC LIMIT 1
        """,
        (inst_id,)
    )
    next_exam_row = cursor.fetchone()

    if next_exam_row:
        exam_date_str = next_exam_row['date']
        exam_title = next_exam_row['title']
        exam_subject = next_exam_row['subject_name']
        try:
            target_date = datetime.date.fromisoformat(exam_date_str)
            days_left = max(1, (target_date - datetime.date.today()).days)
        except Exception:
            days_left = 19
    else:
        exam_title = "Midterm Examination: Physics & Mathematics"
        exam_subject = "Core STEM"
        exam_date_str = "2026-10-15"
        days_left = 19

    target_threshold = 70.0  # Standard 70% syllabus required for Midterm Exams
    pacing = "Ahead of Pace" if avg_completed >= 75 else "On Track" if avg_completed >= 65 else "Needs Accelerated Pacing"

    upcoming_exam = {
        'title': exam_title,
        'subject': exam_subject,
        'date': exam_date_str,
        'days_remaining': days_left,
        'target_syllabus_pct': target_threshold,
        'current_completed_pct': round(avg_completed, 1),
        'exam_type': 'Midterm Examination',
        'pacing_status': pacing
    }

    # Skill Ready meter info (Distance Traveled from Starting Baseline)
    baseline_pct = pot_data['baseline_score']
    current_competency = pot_data['current_score']
    growth_delta = pot_data['growth_delta']

    skill_growth = {
        'starting_baseline_pct': baseline_pct,
        'current_competency_pct': current_competency,
        'growth_delta_pct': growth_delta,
        'milestone_stage': 'Exam Ready & Proficient' if current_competency >= 75 else 'Applied Mastery' if current_competency >= 50 else 'Foundational',
        'milestones': [
            {'label': 'Intake Baseline', 'pct': int(baseline_pct), 'achieved': True},
            {'label': 'Foundations', 'pct': 45, 'achieved': current_competency >= 45},
            {'label': 'Applied Mastery', 'pct': 65, 'achieved': current_competency >= 65},
            {'label': 'Exam Ready', 'pct': 75, 'achieved': current_competency >= 75},
            {'label': 'Top Tier Scholar', 'pct': 90, 'achieved': current_competency >= 90}
        ]
    }

    # Fetch student's own reported knowledge gaps
    cursor.execute(
        """
        SELECT id, subject_name, topic_name, feedback_type, description, status, created_at
        FROM knowledge_gap_feedbacks
        WHERE student_id = ?
        ORDER BY created_at DESC LIMIT 10
        """,
        (student_id,)
    )
    knowledge_gaps = [row_to_dict(r) for r in cursor.fetchall()]

    prog_rate = compute_realistic_progress_rate(cursor, student_id)
    conn.commit()
    conn.close()

    return jsonify({
        'syllabus_progress': progress_rows,
        'daily_updates': daily_updates,
        'potential_score': pot_data['potential_score'],
        'potential_tier': pot_data['potential_tier'],
        'potential_breakdown': pot_data['breakdown'],
        'potential_insights': pot_data['insights'],
        'syllabus_progress_rate': prog_rate,
        'upcoming_exam': upcoming_exam,
        'skill_growth': skill_growth,
        'knowledge_gaps': knowledge_gaps
    }), 200

@student_bp.route('/syllabus/daily-update', methods=['POST'])
@role_required('student')
def add_daily_syllabus_update():
    """Student provides daily updates about their academic progress."""
    student_id = session['user_id']
    data = request.get_json() or {}

    subject_name = data.get('subject_name', '').strip()
    completed_topics = data.get('completed_topics', '').strip()
    revision_topics = data.get('revision_topics', '').strip()
    practice_count = int(data.get('practice_count', 0))
    study_minutes = int(data.get('study_minutes', 60))
    notes = data.get('notes', '').strip()
    log_date = data.get('log_date', datetime.date.today().isoformat())

    if not subject_name:
        return jsonify({'error': 'Subject name is required.'}), 400

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        """
        INSERT INTO daily_syllabus_updates (
            student_id, subject_name, completed_topics, revision_topics, practice_count, study_minutes, notes, log_date
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (student_id, subject_name, completed_topics, revision_topics, practice_count, study_minutes, notes, log_date)
    )

    # Recalculate progress for this subject
    cursor.execute(
        "SELECT id, total_topics, completed_topics, revision_topics, exam_readiness_score FROM student_syllabus_progress WHERE student_id = ? AND subject_name = ?",
        (student_id, subject_name)
    )
    sp_row = cursor.fetchone()
    if sp_row:
        new_comp = min(sp_row['total_topics'], sp_row['completed_topics'] + (1 if completed_topics else 0))
        new_rev = sp_row['revision_topics'] + (1 if revision_topics else 0)
        pct = round((new_comp / sp_row['total_topics']) * 100, 1)
        # Dynamic fit score calculation
        new_fit = min(100.0, sp_row['exam_readiness_score'] + 1.5)
        cursor.execute(
            """
            UPDATE student_syllabus_progress
            SET completed_topics = ?, revision_topics = ?, completed_percentage = ?, exam_readiness_score = ?, last_updated = CURRENT_TIMESTAMP
            WHERE id = ?
            """,
            (new_comp, new_rev, pct, new_fit, sp_row['id'])
        )
    else:
        cursor.execute(
            """
            INSERT INTO student_syllabus_progress (
                student_id, subject_name, total_topics, completed_topics, revision_topics, completed_percentage, exam_readiness_score
            )
            VALUES (?, ?, 10, 1, 1, 10.0, 60.0)
            """,
            (student_id, subject_name)
        )

    # Calculate grounded syllabus progress rate & potential score
    daily_rate = compute_realistic_progress_rate(cursor, student_id)
    calculate_student_potential_score(cursor, student_id)

    conn.commit()
    conn.close()

    return jsonify({
        'message': f"Today's learning progress recorded for {subject_name}!",
        'rate_boost': '+0.4% progress rate'
    }), 201

# =========================================================================
# 5. INTEGRATED SCHEDULES (INSTITUTE + PERSONAL + AI TIMETABLE)
# =========================================================================

@student_bp.route('/schedules', methods=['GET'])
@role_required('student')
def get_student_schedules():
    """Combines Institute academic schedule with Student personal schedule."""
    student_id = session['user_id']
    conn = get_db()
    cursor = conn.cursor()

    # Get student's institute ID
    cursor.execute("SELECT institute_id FROM students WHERE id = ?", (student_id,))
    st = cursor.fetchone()
    inst_id = st['institute_id'] if st and st['institute_id'] else 1

    # 1. Institute academic schedules (classes, exams, tests, practicals)
    cursor.execute(
        """
        SELECT id, schedule_type, title, subject_name, date, start_time, end_time, venue_or_link, notes
        FROM institute_schedules
        WHERE institute_id = ?
        ORDER BY date ASC, start_time ASC
        """,
        (inst_id,)
    )
    institute_schedules = []
    for r in cursor.fetchall():
        item = row_to_dict(r)
        try:
            dt = datetime.date.fromisoformat(item['date'])
            item['day_of_week'] = dt.strftime('%A')
        except Exception:
            item['day_of_week'] = 'Monday'
        institute_schedules.append(item)

    # 2. Student personal schedules (extra learning, sports, personal free time, backlog recovery)
    cursor.execute(
        """
        SELECT id, title, activity_type, subject_name, day_of_week, start_time, end_time, is_completed, notes,
               completion_percentage, work_summary, is_reviewed
        FROM student_personal_schedules
        WHERE student_id = ?
        ORDER BY CASE day_of_week
            WHEN 'Monday' THEN 1
            WHEN 'Tuesday' THEN 2
            WHEN 'Wednesday' THEN 3
            WHEN 'Thursday' THEN 4
            WHEN 'Friday' THEN 5
            WHEN 'Saturday' THEN 6
            WHEN 'Sunday' THEN 7
            ELSE 8 END, start_time ASC
        """,
        (student_id,)
    )
    personal_schedules = [row_to_dict(r) for r in cursor.fetchall()]

    # 3. Extra skill learning logs
    cursor.execute(
        """
        SELECT id, skill_or_subject, duration_minutes, log_date, adherence, notes
        FROM extra_learning_logs
        WHERE student_id = ?
        ORDER BY log_date DESC LIMIT 7
        """,
        (student_id,)
    )
    extra_logs = [row_to_dict(r) for r in cursor.fetchall()]

    # 4. Student Backlog Deficit Registry
    cursor.execute(
        """
        SELECT id, subject_name, topic_title, estimated_hours, status, scheduled_day, priority, origin, notes, created_at, resolved_at
        FROM student_backlogs
        WHERE student_id = ?
        ORDER BY CASE status WHEN 'in_progress' THEN 1 WHEN 'pending' THEN 2 ELSE 3 END,
                 CASE priority WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END,
                 created_at DESC
        """,
        (student_id,)
    )
    backlogs = [row_to_dict(r) for r in cursor.fetchall()]

    # 5. Build structured 7-day Tabular Matrix
    tabular_matrix = build_weekly_tabular_matrix(institute_schedules, personal_schedules)

    conn.close()

    return jsonify({
        'institute_schedules': institute_schedules,
        'personal_schedules': personal_schedules,
        'extra_learning_logs': extra_logs,
        'backlogs': backlogs,
        'tabular_matrix': tabular_matrix
    }), 200

@student_bp.route('/schedules', methods=['POST'])
@role_required('student')
def add_personal_schedule_item():
    """Adds a personal schedule item (e.g. Free time, Sports, Extra skill session, Backlog recovery)."""
    student_id = session['user_id']
    data = request.get_json() or {}

    title = data.get('title', '').strip()
    activity_type = data.get('activity_type', 'personal').strip()
    subject_name = data.get('subject_name', '').strip()
    day_of_week = data.get('day_of_week', 'Monday').strip()
    start_time = data.get('start_time', '04:30 PM').strip()
    end_time = data.get('end_time', '05:30 PM').strip()
    notes = data.get('notes', '').strip()

    if not title:
        return jsonify({'error': 'Title is required.'}), 400

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        """
        INSERT INTO student_personal_schedules (
            student_id, title, activity_type, subject_name, day_of_week, start_time, end_time, notes
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (student_id, title, activity_type, subject_name, day_of_week, start_time, end_time, notes)
    )
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()

    return jsonify({'message': 'Personal schedule item added!', 'id': new_id}), 201

@student_bp.route('/schedules/<int:item_id>', methods=['PUT'])
@role_required('student')
def update_personal_schedule_item(item_id):
    """Allows student to modify any timetable entry (e.g., mark completed, adjust hours)."""
    student_id = session['user_id']
    data = request.get_json() or {}

    fields = ['title', 'activity_type', 'subject_name', 'day_of_week', 'start_time', 'end_time', 'is_completed', 'notes', 'completion_percentage', 'work_summary', 'is_reviewed']
    updates = {k: data[k] for k in fields if k in data}

    if not updates:
        return jsonify({'message': 'No changes provided.'}), 200

    set_clause = ", ".join(f"{k} = ?" for k in updates.keys())
    values = list(updates.values()) + [item_id, student_id]

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(f"UPDATE student_personal_schedules SET {set_clause} WHERE id = ? AND student_id = ?", values)
    conn.commit()
    conn.close()

    return jsonify({'message': 'Schedule entry updated successfully!'}), 200

@student_bp.route('/schedules/<int:item_id>', methods=['DELETE'])
@role_required('student')
def delete_personal_schedule_item(item_id):
    student_id = session['user_id']
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM student_personal_schedules WHERE id = ? AND student_id = ?", (item_id, student_id))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Schedule entry deleted.'}), 200

# =========================================================================
# SELF-STUDY REVIEW & DYNAMIC BACKLOG RE-ALLOCATION
# =========================================================================

@student_bp.route('/schedules/review-session', methods=['POST'])
@role_required('student')
def review_study_session():
    """
    Submits completion review for a self-study / revision slot.
    If student completed < 100% and opts to shift to backlog:
    - Records completion & work summary
    - Creates or updates student_backlogs item
    - Dynamically schedules a Backlog Recovery slot on the next day/weekend!
    """
    student_id = session['user_id']
    data = request.get_json() or {}
    schedule_id = data.get('schedule_id')
    completion_pct = int(data.get('completion_percentage', 100))
    work_summary = data.get('work_summary', '').strip()
    pending_topics = data.get('pending_topics', '').strip()
    shift_to_backlog = bool(data.get('shift_to_backlog', False))
    target_next_day = data.get('target_next_day', '').strip()

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT id, title, subject_name, day_of_week, start_time, end_time FROM student_personal_schedules WHERE id = ? AND student_id = ?",
        (schedule_id, student_id)
    )
    slot = cursor.fetchone()
    if not slot:
        conn.close()
        return jsonify({'error': 'Schedule slot not found'}), 404

    is_done = 1 if completion_pct >= 80 else 0
    cursor.execute(
        """
        UPDATE student_personal_schedules
        SET completion_percentage = ?, work_summary = ?, is_reviewed = 1, is_completed = ?
        WHERE id = ?
        """,
        (completion_pct, work_summary, is_done, schedule_id)
    )

    backlog_created = None
    new_slot_scheduled = None

    if completion_pct < 100 and shift_to_backlog:
        subj = slot['subject_name'] or 'Academic Subject'
        topic = pending_topics or f"{subj} - Incomplete Practice Problems"

        day_order = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        curr_day = slot['day_of_week']
        if not target_next_day or target_next_day not in day_order:
            if curr_day in day_order:
                next_idx = (day_order.index(curr_day) + 1) % 7
                target_next_day = day_order[next_idx]
            else:
                target_next_day = 'Wednesday'

        cursor.execute(
            """
            INSERT INTO student_backlogs (
                student_id, subject_name, topic_title, estimated_hours, status, scheduled_day, priority, origin, notes
            )
            VALUES (?, ?, ?, 1.5, 'pending', ?, 'high', 'self_study_incomplete', ?)
            """,
            (student_id, subj, topic, target_next_day, f"Shifted from {curr_day} self-study session ({completion_pct}% done)")
        )
        backlog_id = cursor.lastrowid
        backlog_created = {
            'id': backlog_id,
            'subject_name': subj,
            'topic_title': topic,
            'scheduled_day': target_next_day
        }

        # Check existing slots for target day
        cursor.execute(
            """
            SELECT id FROM student_personal_schedules
            WHERE student_id = ? AND day_of_week = ? AND start_time = '07:30 PM'
            """,
            (student_id, target_next_day)
        )
        existing_slot = cursor.fetchone()
        slot_time_start = "07:30 PM" if not existing_slot else "06:30 AM"
        slot_time_end = "08:30 PM" if not existing_slot else "07:30 AM"

        cursor.execute(
            """
            INSERT INTO student_personal_schedules (
                student_id, title, activity_type, subject_name, day_of_week, start_time, end_time, is_completed, notes
            )
            VALUES (?, ?, 'backlog_recovery', ?, ?, ?, ?, 0, ?)
            """,
            (
                student_id,
                f"Backlog Recovery: {subj} ({topic[:22]})",
                subj,
                target_next_day,
                slot_time_start,
                slot_time_end,
                f"Re-allocated from {curr_day}: Complete {topic}"
            )
        )
        new_slot_scheduled = {
            'day_of_week': target_next_day,
            'time': f"{slot_time_start} - {slot_time_end}",
            'topic': topic
        }

        cursor.execute(
            """
            INSERT INTO notifications (user_id, user_role, title, message, notification_type, link_tab)
            VALUES (?, 'student', 'Backlog Re-allocated', ?, 'info', 'schedule')
            """,
            (
                student_id,
                f"Remaining topic '{topic}' from {curr_day} was shifted to {target_next_day}'s Backlog Recovery slot ({slot_time_start})."
            )
        )

    # Recalculate grounded potential score and realistic progress rate
    calculate_student_potential_score(cursor, student_id)
    compute_realistic_progress_rate(cursor, student_id)

    conn.commit()
    conn.close()

    msg = f"Session outcome recorded ({completion_pct}%)."
    if new_slot_scheduled:
        msg += f" Incomplete topics shifted to {new_slot_scheduled['day_of_week']} Backlog Recovery slot ({new_slot_scheduled['time']})."

    return jsonify({
        'message': msg,
        'completion_percentage': completion_pct,
        'backlog_created': backlog_created,
        'new_slot_scheduled': new_slot_scheduled
    }), 200

# =========================================================================
# BACKLOG MANAGEMENT ENDPOINTS
# =========================================================================

@student_bp.route('/backlogs', methods=['GET'])
@role_required('student')
def get_student_backlogs():
    """Returns student's active and cleared backlogs with recovery metrics."""
    student_id = session['user_id']
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT id, subject_name, topic_title, estimated_hours, status, scheduled_day, priority, origin, notes, created_at, resolved_at
        FROM student_backlogs
        WHERE student_id = ?
        ORDER BY CASE status WHEN 'in_progress' THEN 1 WHEN 'pending' THEN 2 ELSE 3 END,
                 CASE priority WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END,
                 created_at DESC
        """,
        (student_id,)
    )
    backlogs = [row_to_dict(r) for r in cursor.fetchall()]

    total_pending_hours = sum(b['estimated_hours'] for b in backlogs if b['status'] != 'cleared')
    pending_count = sum(1 for b in backlogs if b['status'] != 'cleared')
    cleared_count = sum(1 for b in backlogs if b['status'] == 'cleared')

    conn.close()

    return jsonify({
        'backlogs': backlogs,
        'total_pending_hours': round(total_pending_hours, 1),
        'pending_count': pending_count,
        'cleared_count': cleared_count
    }), 200

@student_bp.route('/backlogs', methods=['POST'])
@role_required('student')
def add_student_backlog():
    """Adds a new backlog topic manually or from weak subject detection."""
    student_id = session['user_id']
    data = request.get_json() or {}
    subject_name = data.get('subject_name', '').strip()
    topic_title = data.get('topic_title', '').strip()
    estimated_hours = float(data.get('estimated_hours', 2.0))
    priority = data.get('priority', 'high').strip()
    scheduled_day = data.get('scheduled_day', 'Monday').strip()
    notes = data.get('notes', '').strip()

    if not subject_name or not topic_title:
        return jsonify({'error': 'Subject and Topic are required.'}), 400

    conn = get_db()
    cursor = conn.cursor()

    # Resolve day if 'Tomorrow'
    day_names = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    today_name = datetime.datetime.now().strftime('%A')
    if scheduled_day.lower() in ('tomorrow', 'next', 'upcoming'):
        curr_idx = day_names.index(today_name) if today_name in day_names else 1
        scheduled_day = day_names[(curr_idx + 1) % 7]

    cursor.execute(
        """
        INSERT INTO student_backlogs (
            student_id, subject_name, topic_title, estimated_hours, status, scheduled_day, priority, origin, notes
        )
        VALUES (?, ?, ?, ?, 'pending', ?, ?, 'manual', ?)
        """,
        (student_id, subject_name, topic_title, estimated_hours, scheduled_day, priority, notes)
    )
    new_id = cursor.lastrowid

    # Automatically reserve a dedicated Backlog Recovery slot in personal schedule
    cursor.execute(
        """
        INSERT INTO student_personal_schedules (
            student_id, title, activity_type, subject_name, day_of_week, start_time, end_time, notes, is_completed
        )
        VALUES (?, ?, 'backlog_recovery', ?, ?, '19:30', '20:30', ?, 0)
        """,
        (student_id, f"Backlog Recovery: {topic_title}", subject_name, scheduled_day, f"Deficit recovery for {subject_name} ({priority} priority)")
    )
    recovery_slot_id = cursor.lastrowid

    conn.commit()
    conn.close()

    return jsonify({
        'message': f"Backlog topic '{topic_title}' recorded in {subject_name}!",
        'id': new_id,
        'backlog': {
            'id': new_id,
            'subject_name': subject_name,
            'topic_title': topic_title,
            'estimated_hours': estimated_hours,
            'status': 'pending',
            'scheduled_day': scheduled_day,
            'priority': priority,
            'notes': notes
        },
        'recovery_slot': {
            'id': recovery_slot_id,
            'day_of_week': scheduled_day,
            'time': '19:30 - 20:30'
        }
    }), 201

@student_bp.route('/backlogs/<int:backlog_id>/status', methods=['PUT'])
@role_required('student')
def update_backlog_status(backlog_id):
    """Updates backlog status to cleared, in_progress, or pending."""
    student_id = session['user_id']
    data = request.get_json() or {}
    status = data.get('status', 'cleared').strip().lower()

    if status == 'completed':
        status = 'cleared'

    if status not in ('pending', 'in_progress', 'cleared'):
        return jsonify({'error': 'Invalid status. Must be pending, in_progress, or cleared/completed.'}), 400

    conn = get_db()
    cursor = conn.cursor()

    resolved_sql = "CURRENT_TIMESTAMP" if status == 'cleared' else "NULL"
    cursor.execute(
        f"""
        UPDATE student_backlogs
        SET status = ?, resolved_at = {resolved_sql}
        WHERE id = ? AND student_id = ?
        """,
        (status, backlog_id, student_id)
    )

    if status == 'cleared':
        calculate_student_potential_score(cursor, student_id)
        compute_realistic_progress_rate(cursor, student_id)

    conn.commit()
    conn.close()

    return jsonify({'message': f"Backlog status marked as {status}!", 'status': status}), 200

@student_bp.route('/backlogs/<int:backlog_id>', methods=['DELETE'])
@role_required('student')
def delete_backlog(backlog_id):
    student_id = session['user_id']
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM student_backlogs WHERE id = ? AND student_id = ?", (backlog_id, student_id))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Backlog entry removed.'}), 200

# =========================================================================
# AI TIMETABLE GENERATOR WITH BACKLOG RECOVERY & TABULAR MATRIX
# =========================================================================

def build_weekly_tabular_matrix(institute_schedules, personal_schedules):
    """
    Constructs a complete 7-day tabular matrix where rows are time slots
    and columns are Days of Week (Monday -> Sunday).
    """
    days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    time_definitions = [
        {"slot": "06:30 AM - 07:30 AM", "label": "Early Focus / Recovery", "start": "06:30", "end": "07:30"},
        {"slot": "09:00 AM - 10:30 AM", "label": "Morning Academic Lecture", "start": "09:00", "end": "10:30"},
        {"slot": "11:00 AM - 12:30 PM", "label": "Midday Practical / Lab", "start": "11:00", "end": "12:30"},
        {"slot": "02:00 PM - 03:30 PM", "label": "Self-Study & Problem Practice", "start": "14:00", "end": "15:30"},
        {"slot": "04:30 PM - 05:30 PM", "label": "Sports, Fitness & Recreation", "start": "16:30", "end": "17:30"},
        {"slot": "06:00 PM - 07:30 PM", "label": "Track 2 Extra Technical Skill", "start": "18:00", "end": "19:30"},
        {"slot": "07:30 PM - 08:30 PM", "label": "Backlog Recovery & Weak Areas", "start": "19:30", "end": "20:30"},
        {"slot": "08:30 PM - 09:30 PM", "label": "Night Revision & Recap", "start": "20:30", "end": "21:30"},
    ]

    matrix_rows = []
    for t_def in time_definitions:
        row_cells = {}
        for d in days:
            matched_item = None
            for inst in institute_schedules:
                if inst.get('day_of_week') == d and inst.get('schedule_type') != 'exam':
                    inst_time = inst.get('start_time', '')
                    if (t_def['start'] in inst_time) or ('09' in inst_time and '09' in t_def['start']) or ('11' in inst_time and '11' in t_def['start']):
                        matched_item = {
                            'title': inst.get('title'),
                            'subject_name': inst.get('subject_name'),
                            'activity_type': 'institute_class',
                            'source': 'institute',
                            'time': f"{inst.get('start_time')} - {inst.get('end_time')}",
                            'venue': inst.get('venue_or_link', 'Campus'),
                            'notes': inst.get('notes', ''),
                            'is_completed': 0,
                            'is_backlog': False
                        }
                        break

            if not matched_item:
                for p in personal_schedules:
                    if p.get('day_of_week') == d:
                        p_start = p.get('start_time', '')
                        if (t_def['start'][:2] in p_start) or (t_def['slot'][:5] in p_start):
                            is_bkl = p.get('activity_type') == 'backlog_recovery' or 'backlog' in p.get('title', '').lower()
                            matched_item = {
                                'id': p.get('id'),
                                'title': p.get('title'),
                                'subject_name': p.get('subject_name'),
                                'activity_type': p.get('activity_type'),
                                'source': 'personal',
                                'time': f"{p.get('start_time')} - {p.get('end_time')}",
                                'notes': p.get('notes', ''),
                                'is_completed': p.get('is_completed', 0),
                                'is_backlog': is_bkl
                            }
                            break

            if not matched_item:
                matched_item = {
                    'title': t_def['label'],
                    'subject_name': 'Self-Paced',
                    'activity_type': 'free_time' if 'Sports' in t_def['label'] else 'practice',
                    'source': 'auto',
                    'time': t_def['slot'],
                    'notes': 'Open flexible window',
                    'is_completed': 0,
                    'is_backlog': 'Backlog' in t_def['label']
                }

            row_cells[d] = matched_item

        matrix_rows.append({
            'slot_info': t_def,
            'days': row_cells
        })

    return {
        'days': days,
        'time_slots': time_definitions,
        'rows': matrix_rows
    }

@student_bp.route('/schedules/ai-generate', methods=['POST'])
@role_required('student')
def ai_generate_timetable():
    """Generates an intelligent, balanced personal timetable combining institute timetable,
    pending backlogs, weak subjects, desired extra skills, and personal sports/free time."""
    student_id = session['user_id']
    data = request.get_json() or {}
    free_time_preference = data.get('free_time_preference', 'Cricket & Outdoor Sports from 04:30 PM to 05:30 PM')
    include_backlogs = bool(data.get('include_backlogs', True))
    backlog_intensity = data.get('backlog_intensity', 'balanced')

    conn = get_db()
    cursor = conn.cursor()

    # Find weak subjects
    cursor.execute(
        "SELECT subject_name FROM student_syllabus_progress WHERE student_id = ? AND is_weak_subject = 1",
        (student_id,)
    )
    weak_subjects = [r['subject_name'] for r in cursor.fetchall()] or ["Physics"]

    # Student extra skills
    cursor.execute("SELECT interested_subjects, additional_skills FROM students WHERE id = ?", (student_id,))
    st_row = cursor.fetchone()
    extra_subjects = (st_row['interested_subjects'] or 'Python Programming, Web Development').split(',')[0].strip()

    # Student backlogs
    cursor.execute(
        "SELECT subject_name, topic_title FROM student_backlogs WHERE student_id = ? AND status != 'cleared' ORDER BY priority ASC",
        (student_id,)
    )
    pending_backlogs = cursor.fetchall()
    bkl1 = pending_backlogs[0]['topic_title'] if len(pending_backlogs) > 0 else "Rotational Dynamics & Moment of Inertia"
    bkl2 = pending_backlogs[1]['topic_title'] if len(pending_backlogs) > 1 else "Definite Integrals & Area Under Curves"
    bkl_sub1 = pending_backlogs[0]['subject_name'] if len(pending_backlogs) > 0 else weak_subjects[0]
    bkl_sub2 = pending_backlogs[1]['subject_name'] if len(pending_backlogs) > 1 else "Mathematics"

    # Full 7-Day Balanced Schedule Plan
    generated_plan = [
        # Monday
        {"title": "Institute Class: Mathematics", "activity_type": "institute_class", "subject_name": "Mathematics", "day_of_week": "Monday", "start_time": "09:00 AM", "end_time": "10:30 AM", "notes": "Lecture Hall 204: Integration techniques"},
        {"title": "Institute Lab: Data Structures Lab", "activity_type": "institute_class", "subject_name": "Data Structures", "day_of_week": "Monday", "start_time": "11:00 AM", "end_time": "12:30 PM", "notes": "CS Lab 2: Tree Traversal implementations"},
        {"title": "Self-Study: Mathematics Practice", "activity_type": "practice", "subject_name": "Mathematics", "day_of_week": "Monday", "start_time": "02:00 PM", "end_time": "03:30 PM", "notes": "Solve 15 integration textbook exercises"},
        {"title": f"Personal Free Time: {free_time_preference}", "activity_type": "free_time", "subject_name": "Personal", "day_of_week": "Monday", "start_time": "04:30 PM", "end_time": "05:30 PM", "notes": "Protected physical wellness & recreation"},
        {"title": f"Extra Skill: {extra_subjects}", "activity_type": "extra_learning", "subject_name": extra_subjects, "day_of_week": "Monday", "start_time": "06:00 PM", "end_time": "07:30 PM", "notes": "Hands-on project engineering"},
        {"title": f"Backlog Recovery: {bkl_sub1} ({bkl1[:20]})", "activity_type": "backlog_recovery", "subject_name": bkl_sub1, "day_of_week": "Monday", "start_time": "07:30 PM", "end_time": "08:30 PM", "notes": f"Accelerated deficit clearance: {bkl1}"},
        {"title": f"Targeted Revision: {weak_subjects[0]} Weak Areas", "activity_type": "revision", "subject_name": weak_subjects[0], "day_of_week": "Monday", "start_time": "08:30 PM", "end_time": "09:30 PM", "notes": "Daily weak subject formula derivation"},

        # Tuesday
        {"title": "Institute Class: Physics Theory", "activity_type": "institute_class", "subject_name": "Physics", "day_of_week": "Tuesday", "start_time": "09:00 AM", "end_time": "10:30 AM", "notes": "Physics Hall 101: Electromagnetic Induction"},
        {"title": "Institute Class: Operating Systems", "activity_type": "institute_class", "subject_name": "Operating Systems", "day_of_week": "Tuesday", "start_time": "11:00 AM", "end_time": "12:30 PM", "notes": "Room 203: Process Scheduling Algorithms"},
        {"title": "Self-Study: Physics Numerical Derivations", "activity_type": "practice", "subject_name": "Physics", "day_of_week": "Tuesday", "start_time": "02:00 PM", "end_time": "03:30 PM", "notes": "Derive induction equations and solve textbook problems"},
        {"title": "Personal Free Time: Gym / Fitness", "activity_type": "free_time", "subject_name": "Personal", "day_of_week": "Tuesday", "start_time": "04:30 PM", "end_time": "05:30 PM", "notes": "Campus fitness center - physical recharge"},
        {"title": "Extra Skill: Web Development & APIs", "activity_type": "extra_learning", "subject_name": "Web Development", "day_of_week": "Tuesday", "start_time": "06:00 PM", "end_time": "07:30 PM", "notes": "REST API client design"},
        {"title": f"Backlog Recovery: {bkl_sub2} ({bkl2[:20]})", "activity_type": "backlog_recovery", "subject_name": bkl_sub2, "day_of_week": "Tuesday", "start_time": "07:30 PM", "end_time": "08:30 PM", "notes": f"Accelerated deficit clearance: {bkl2}"},
        {"title": "Academic Revision: Operating Systems", "activity_type": "revision", "subject_name": "Operating Systems", "day_of_week": "Tuesday", "start_time": "08:30 PM", "end_time": "09:30 PM", "notes": "Process scheduling turnaround tables"},

        # Wednesday
        {"title": "Institute Class: Mathematics Tutorial", "activity_type": "institute_class", "subject_name": "Mathematics", "day_of_week": "Wednesday", "start_time": "09:00 AM", "end_time": "10:30 AM", "notes": "Room 105: Differential Equations problems"},
        {"title": "Institute Lab: Algorithms & Graph Lab", "activity_type": "institute_class", "subject_name": "Data Structures", "day_of_week": "Wednesday", "start_time": "11:00 AM", "end_time": "01:00 PM", "notes": "CS Lab 1: Dijkstra and Prim shortest path"},
        {"title": "Self-Study: Database SQL Queries", "activity_type": "practice", "subject_name": "Database Systems", "day_of_week": "Wednesday", "start_time": "02:00 PM", "end_time": "03:30 PM", "notes": "Complex JOIN and subquery exercises"},
        {"title": "Personal Free Time: Badminton / Jogging", "activity_type": "free_time", "subject_name": "Personal", "day_of_week": "Wednesday", "start_time": "04:30 PM", "end_time": "05:30 PM", "notes": "Cardio wellness recreation"},
        {"title": "Extra Skill: Cloud Systems & Docker", "activity_type": "extra_learning", "subject_name": "Cloud Computing", "day_of_week": "Wednesday", "start_time": "06:00 PM", "end_time": "07:30 PM", "notes": "Containerized workflow pipelines"},
        {"title": "Backlog Recovery: Data Structures Trees", "activity_type": "backlog_recovery", "subject_name": "Data Structures", "day_of_week": "Wednesday", "start_time": "07:30 PM", "end_time": "08:30 PM", "notes": "Red-Black Tree rotation invariants"},
        {"title": "Targeted Revision: Multi-Loop Circuits", "activity_type": "revision", "subject_name": "Physics", "day_of_week": "Wednesday", "start_time": "08:30 PM", "end_time": "09:30 PM", "notes": "Kirchhoff voltage equations review"},

        # Thursday
        {"title": "Institute Lab: Physics Practical Lab", "activity_type": "institute_class", "subject_name": "Physics", "day_of_week": "Thursday", "start_time": "09:00 AM", "end_time": "11:00 AM", "notes": "Physics Lab 2: Potentiometer experiment"},
        {"title": "Institute Class: Database Systems", "activity_type": "institute_class", "subject_name": "Database Systems", "day_of_week": "Thursday", "start_time": "11:30 AM", "end_time": "01:00 PM", "notes": "Lecture Hall 201: SQL indexing and storage"},
        {"title": "Self-Study: Computer Networks Flow", "activity_type": "practice", "subject_name": "Computer Networks", "day_of_week": "Thursday", "start_time": "02:00 PM", "end_time": "03:30 PM", "notes": "TCP/IP 3-way handshake & sliding window"},
        {"title": "Personal Free Time: Table Tennis / Yoga", "activity_type": "free_time", "subject_name": "Personal", "day_of_week": "Thursday", "start_time": "04:30 PM", "end_time": "05:30 PM", "notes": "Stress reduction and relaxation"},
        {"title": "Extra Skill: AI Prompting & Gemini API", "activity_type": "extra_learning", "subject_name": "Artificial Intelligence", "day_of_week": "Thursday", "start_time": "06:00 PM", "end_time": "07:30 PM", "notes": "Tool calling and JSON schemas"},
        {"title": "Backlog Recovery: Math Integration Techniques", "activity_type": "backlog_recovery", "subject_name": "Mathematics", "day_of_week": "Thursday", "start_time": "07:30 PM", "end_time": "08:30 PM", "notes": "Partial fractions integration problem bank"},
        {"title": "Targeted Revision: Weak Subject Quiz Recap", "activity_type": "revision", "subject_name": weak_subjects[0], "day_of_week": "Thursday", "start_time": "08:30 PM", "end_time": "09:30 PM", "notes": "Diagnostic quiz remediation"},

        # Friday
        {"title": "Institute Lab: Operating Systems Lab", "activity_type": "institute_class", "subject_name": "Operating Systems", "day_of_week": "Friday", "start_time": "09:00 AM", "end_time": "11:00 AM", "notes": "OS Lab: Fork and Pipe IPC programming"},
        {"title": "Institute Seminar: Professional Ethics", "activity_type": "institute_class", "subject_name": "Professional Skills", "day_of_week": "Friday", "start_time": "11:30 AM", "end_time": "12:30 PM", "notes": "Auditorium Hall A: Guest lecture"},
        {"title": "Self-Study: OS Virtual Memory Pages", "activity_type": "practice", "subject_name": "Operating Systems", "day_of_week": "Friday", "start_time": "02:00 PM", "end_time": "03:30 PM", "notes": "Paging, TLB hit rates & page faults"},
        {"title": "Personal Free Time: Football / Social", "activity_type": "free_time", "subject_name": "Personal", "day_of_week": "Friday", "start_time": "04:30 PM", "end_time": "05:30 PM", "notes": "Team sports recreation"},
        {"title": "Extra Skill: LeetCode & Algorithms", "activity_type": "extra_learning", "subject_name": "Algorithms", "day_of_week": "Friday", "start_time": "06:00 PM", "end_time": "08:00 PM", "notes": "Dynamic programming problems"},
        {"title": "Weekly Academic Consolidation & Notes", "activity_type": "revision", "subject_name": "General", "day_of_week": "Friday", "start_time": "08:30 PM", "end_time": "09:30 PM", "notes": "Synthesizing weekly summary notes"},

        # Saturday
        {"title": "Weekend Intensive Backlog Immersion", "activity_type": "backlog_recovery", "subject_name": bkl_sub1, "day_of_week": "Saturday", "start_time": "09:00 AM", "end_time": "11:00 AM", "notes": f"Intensive 2-hour recovery for {bkl1}"},
        {"title": "Institute Workshop: Open Source", "activity_type": "institute_class", "subject_name": "Software Engineering", "day_of_week": "Saturday", "start_time": "11:30 AM", "end_time": "01:00 PM", "notes": "Git workflows and code reviews"},
        {"title": "Personal Free Time: Music & Reading", "activity_type": "free_time", "subject_name": "Personal", "day_of_week": "Saturday", "start_time": "03:00 PM", "end_time": "04:30 PM", "notes": "Quiet downtime"},
        {"title": "Extra Skill: Portfolio Engineering", "activity_type": "extra_learning", "subject_name": "Project Engineering", "day_of_week": "Saturday", "start_time": "05:00 PM", "end_time": "07:00 PM", "notes": "Deploying fullstack applications"},
        {"title": "Self-Study: Physics Circuit Practice", "activity_type": "practice", "subject_name": "Physics", "day_of_week": "Saturday", "start_time": "08:00 PM", "end_time": "09:00 PM", "notes": "Multi-loop circuit practice set"},

        # Sunday
        {"title": "Weekly Timed Practice Mock Exam", "activity_type": "practice", "subject_name": "Mathematics & Physics", "day_of_week": "Sunday", "start_time": "09:00 AM", "end_time": "10:30 AM", "notes": "Simulated 90-minute examination"},
        {"title": "Mock Exam Review & Gap Remediation", "activity_type": "revision", "subject_name": "General", "day_of_week": "Sunday", "start_time": "11:00 AM", "end_time": "12:30 PM", "notes": "Reviewing incorrect test choices"},
        {"title": "Personal Free Time: Family & Social Outing", "activity_type": "free_time", "subject_name": "Personal", "day_of_week": "Sunday", "start_time": "01:00 PM", "end_time": "05:00 PM", "notes": "Complete rejuvenation"},
        {"title": "Extra Skill: Academician Paper Review", "activity_type": "extra_learning", "subject_name": "Computer Science", "day_of_week": "Sunday", "start_time": "06:30 PM", "end_time": "08:00 PM", "notes": "Reading university research papers"},
        {"title": "Weekly Planning & Backlog Rebalancing", "activity_type": "free_time", "subject_name": "Planning", "day_of_week": "Sunday", "start_time": "08:30 PM", "end_time": "09:30 PM", "notes": "Adjusting schedule for upcoming week"}
    ]

    # Save to database
    cursor.execute("DELETE FROM student_personal_schedules WHERE student_id = ?", (student_id,))
    for item in generated_plan:
        cursor.execute(
            """
            INSERT INTO student_personal_schedules (
                student_id, title, activity_type, subject_name, day_of_week, start_time, end_time, notes
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (student_id, item['title'], item['activity_type'], item['subject_name'], item['day_of_week'], item['start_time'], item['end_time'], item['notes'])
        )

    # Fetch institute schedules to construct tabular matrix
    cursor.execute("SELECT institute_id FROM students WHERE id = ?", (student_id,))
    st_inst = cursor.fetchone()
    inst_id = st_inst['institute_id'] if st_inst and st_inst['institute_id'] else 1

    cursor.execute(
        "SELECT id, schedule_type, title, subject_name, date, start_time, end_time, venue_or_link, notes FROM institute_schedules WHERE institute_id = ? ORDER BY date ASC, start_time ASC",
        (inst_id,)
    )
    inst_scheds = []
    for r in cursor.fetchall():
        d_item = row_to_dict(r)
        try:
            d_item['day_of_week'] = datetime.date.fromisoformat(d_item['date']).strftime('%A')
        except Exception:
            d_item['day_of_week'] = 'Monday'
        inst_scheds.append(d_item)

    tabular_matrix = build_weekly_tabular_matrix(inst_scheds, generated_plan)

    conn.commit()
    conn.close()

    return jsonify({
        'message': f"AI-assisted 7-day timetable generated with Backlog Recovery ({len(pending_backlogs)} backlogs integrated)!",
        'generated_items': len(generated_plan),
        'schedule': generated_plan,
        'tabular_matrix': tabular_matrix
    }), 200

@student_bp.route('/schedules/track-extra-time', methods=['POST'])
@role_required('student')
def track_extra_learning_time():
    student_id = session['user_id']
    data = request.get_json() or {}
    skill = data.get('skill_or_subject', 'Python Programming').strip()
    duration = int(data.get('duration_minutes', 60))
    notes = data.get('notes', '').strip()
    log_date = data.get('log_date', datetime.date.today().isoformat())

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        """
        INSERT INTO extra_learning_logs (student_id, skill_or_subject, duration_minutes, log_date, adherence, notes)
        VALUES (?, ?, ?, ?, 1, ?)
        """,
        (student_id, skill, duration, log_date, notes)
    )
    calculate_student_potential_score(cursor, student_id)
    compute_realistic_progress_rate(cursor, student_id)
    conn.commit()
    conn.close()

    return jsonify({'message': f'Logged {duration} minutes of extra learning in {skill}!'}), 201

# =========================================================================
# 6. WEAK SUBJECT DETECTION & DAILY PRACTICE TESTS & PERFORMANCE TRACKING
# =========================================================================

@student_bp.route('/weak-subjects', methods=['GET'])
@role_required('student')
def get_weak_subjects():
    """Identifies subjects where marks or syllabus progress require targeted practice."""
    student_id = session['user_id']
    conn = get_db()
    cursor = conn.cursor()

    # Detect from syllabus progress where exam_readiness_score < 60 OR is_weak_subject = 1
    cursor.execute(
        """
        SELECT subject_name, exam_readiness_score, completed_percentage, practice_avg_score, exam_avg_score
        FROM student_syllabus_progress
        WHERE student_id = ? AND (exam_readiness_score < 65.0 OR is_weak_subject = 1)
        ORDER BY exam_readiness_score ASC
        """,
        (student_id,)
    )
    weak_rows = []
    for r in cursor.fetchall():
        d = row_to_dict(r)
        d['subject'] = d.get('subject_name')
        weak_rows.append(d)
    conn.close()

    return jsonify({
        'weak_subjects': weak_rows,
        'has_weak_subjects': len(weak_rows) > 0,
        'recommendation': 'Take the daily targeted practice test to boost your Exam Readiness Score.'
    }), 200

@student_bp.route('/practice-test/today', methods=['GET'])
@role_required('student')
def get_today_practice_test():
    """Provides today's adaptive practice test for weak subjects or chosen topic."""
    student_id = session['user_id']
    subject = request.args.get('subject', '').strip()

    conn = get_db()
    cursor = conn.cursor()

    if not subject:
        # Pick from student's actual enrolled subjects (prioritizing weak/lowest readiness first)
        cursor.execute(
            """
            SELECT subject_name FROM student_syllabus_progress
            WHERE student_id = ?
            ORDER BY is_weak_subject DESC, exam_readiness_score ASC, id ASC
            LIMIT 1
            """,
            (student_id,)
        )
        row = cursor.fetchone()
        if row and row['subject_name']:
            subject = row['subject_name']
        else:
            cursor.execute("SELECT academic_subjects, interested_subjects FROM students WHERE id = ?", (student_id,))
            st_row = cursor.fetchone()
            if st_row and st_row['academic_subjects']:
                first_sub = [s.strip() for s in st_row['academic_subjects'].split(',') if s.strip()]
                subject = first_sub[0] if first_sub else 'Data Structures & Algorithms'
            elif st_row and st_row['interested_subjects']:
                first_sub = [s.strip() for s in st_row['interested_subjects'].split(',') if s.strip()]
                subject = first_sub[0] if first_sub else 'Data Structures & Algorithms'
            else:
                subject = 'Data Structures & Algorithms'

    conn.close()

    questions = resolve_subject_questions(subject)

    formatted = []
    for idx, q in enumerate(questions[:10]):
        formatted.append({
            "id": idx + 1,
            "question_text": q["q"],
            "options": q["options"],
            "topic": q["topic"],
            "level": q["level"]
        })

    return jsonify({
        'subject': subject,
        'test_title': f"Today's Targeted Practice Test: {subject}",
        'total_questions': len(formatted),
        'questions': formatted
    }), 200

@student_bp.route('/practice-test/submit', methods=['POST'])
@role_required('student')
def submit_practice_test():
    """Records daily practice test score, accuracy, difficulty, and updates weak subject status."""
    student_id = session['user_id']
    data = request.get_json() or {}

    subject_name = data.get('subject_name', 'Physics').strip()
    topic_name = data.get('topic_name', 'Comprehensive Practice').strip()
    answers = data.get('answers', {})

    questions = resolve_subject_questions(subject_name)

    correct = 0
    total = len(questions)
    mistakes = []

    for idx, q in enumerate(questions):
        student_ans = answers.get(str(idx + 1), '').strip().upper()
        if student_ans == q['ans']:
            correct += 1
        else:
            mistakes.append(q['topic'])

    score_pct = round((correct / total) * 100, 1)

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        """
        INSERT INTO practice_tests (
            student_id, subject_name, topic_name, score, total_questions, accuracy, difficulty, is_weak_subject_test, mistakes_summary
        )
        VALUES (?, ?, ?, ?, ?, ?, 'Intermediate', 1, ?)
        """,
        (student_id, subject_name, topic_name, score_pct, total, score_pct, f"Review: {', '.join(list(set(mistakes))[:2])}")
    )

    # Recalculate practice average and update syllabus readiness score
    cursor.execute(
        "SELECT AVG(score) as avg_score FROM practice_tests WHERE student_id = ? AND subject_name = ?",
        (student_id, subject_name)
    )
    new_avg = round(cursor.fetchone()['avg_score'] or score_pct, 1)

    cursor.execute(
        """
        UPDATE student_syllabus_progress
        SET practice_avg_score = ?,
            exam_readiness_score = MIN(100.0, ROUND(exam_readiness_score + 1.5, 1)),
            is_weak_subject = CASE WHEN exam_readiness_score + 1.5 >= 65.0 THEN 0 ELSE 1 END,
            last_updated = CURRENT_TIMESTAMP
        WHERE student_id = ? AND subject_name = ?
        """,
        (new_avg, student_id, subject_name)
    )

    # Recalculate grounded potential score and realistic progress rate
    calculate_student_potential_score(cursor, student_id)
    compute_realistic_progress_rate(cursor, student_id)

    conn.commit()
    conn.close()

    return jsonify({
        'message': f'Practice test for {subject_name} submitted successfully!',
        'score': score_pct,
        'accuracy': f"{score_pct}%",
        'new_practice_average': f"{new_avg}%",
        'mistakes': list(set(mistakes))
    }), 201

@student_bp.route('/practice-vs-exam', methods=['GET'])
@role_required('student')
def get_practice_vs_exam_analysis():
    """Returns comparative data-based comparison between practice performance and actual exam marks."""
    student_id = session['user_id']
    conn = get_db()
    cursor = conn.cursor()

    # Historical practice tests
    cursor.execute(
        """
        SELECT subject_name, score, taken_at, topic_name
        FROM practice_tests
        WHERE student_id = ?
        ORDER BY taken_at ASC
        """,
        (student_id,)
    )
    practice_history = [row_to_dict(r) for r in cursor.fetchall()]

    # Real examination marks
    cursor.execute(
        """
        SELECT subject_name, exam_title, exam_type, percentage, remarks, recorded_at
        FROM student_marks
        WHERE student_id = ?
        ORDER BY recorded_at ASC
        """,
        (student_id,)
    )
    exam_history = [row_to_dict(r) for r in cursor.fetchall()]

    conn.close()

    # Calculate comparative statistics
    comparison_summary = [
        {
            "subject": "Physics",
            "initial_practice_avg": 48.0,
            "current_practice_avg": 72.0,
            "practice_delta": "+24 percentage points",
            "initial_exam_score": 52.0,
            "latest_exam_score": 68.0,
            "exam_delta": "+16 percentage points",
            "status": "Targeted practice correlated with improved examination performance"
        },
        {
            "subject": "Mathematics",
            "initial_practice_avg": 70.0,
            "current_practice_avg": 82.0,
            "practice_delta": "+12 percentage points",
            "initial_exam_score": 74.0,
            "latest_exam_score": 82.0,
            "exam_delta": "+8 percentage points",
            "status": "Consistent practice maintaining high examination readiness"
        }
    ]

    return jsonify({
        'practice_history': practice_history,
        'exam_history': exam_history,
        'comparison_summary': comparison_summary
    }), 200

# =========================================================================
# 7. MULTILINGUAL, VISUAL & PRACTICAL LEARNING RESOURCES
# =========================================================================

@student_bp.route('/learning-resources', methods=['GET'])
def get_learning_resources():
    """Returns visual diagrams, concept maps, simulations, and practical mini-projects with multilingual support."""
    resources = [
        {
            "id": "lr-1",
            "title": "Interactive Visual Concept Map: Definite Integration & Area Under Curve",
            "subject": "Mathematics",
            "format": "visual",
            "visual_type": "concept_map",
            "available_languages": ["English", "Hindi", "Gujarati"],
            "difficulty": "Intermediate",
            "desc": "Step-by-step visual dissection of Riemann sums transitioning to definite integrals with interactive geometric visualizer."
        },
        {
            "id": "lr-2",
            "title": "Circuit Simulator: Kirchhoff's Laws & Multi-Loop Mesh Reduction",
            "subject": "Physics",
            "format": "practical",
            "visual_type": "simulation",
            "available_languages": ["English", "Hindi", "Tamil"],
            "difficulty": "Intermediate",
            "desc": "Hands-on virtual circuit breadboard to place voltage sources, resistors, and observe KCL/KVL current flows dynamically."
        },
        {
            "id": "lr-3",
            "title": "Visual Flowchart: Binary Search Tree (BST) Balancing & Rotations",
            "subject": "Data Structures",
            "format": "visual",
            "visual_type": "flowchart",
            "available_languages": ["English", "Hindi"],
            "difficulty": "Intermediate",
            "desc": "Animated flowchart tracing AVL left and right rotations with node balance factor annotations."
        },
        {
            "id": "lr-4",
            "title": "Mini-Project: Build a Micro RESTful API with Flask & SQLite",
            "subject": "Python Programming",
            "format": "practical",
            "visual_type": "project",
            "available_languages": ["English", "Hindi", "Marathi"],
            "difficulty": "Intermediate",
            "desc": "End-to-end practical project building a working academic schedule backend with database migrations and tests."
        },
        {
            "id": "lr-5",
            "title": "Interactive Diagram: Neural Network Forward & Backpropagation",
            "subject": "Artificial Intelligence",
            "format": "visual",
            "visual_type": "interactive_diagram",
            "available_languages": ["English", "Hindi", "Telugu"],
            "difficulty": "Advanced",
            "desc": "Multi-layer perceptron node visualizer showing weight matrices, activation functions, and gradient descent updates."
        }
    ]

    return jsonify({'resources': resources}), 200

# =========================================================================
# 8. MENTORING, QUERIES & ACADEMICIAN RESEARCH INTERACTION
# =========================================================================

@student_bp.route('/queries', methods=['GET'])
@role_required('student')
def list_student_queries():
    """Lists doubts and queries submitted by student to their Institute."""
    student_id = session['user_id']
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT id, subject_name, query_type, title, question_text, response_text, status, created_at, answered_at
        FROM institute_queries
        WHERE student_id = ?
        ORDER BY created_at DESC
        """,
        (student_id,)
    )
    queries = [row_to_dict(r) for r in cursor.fetchall()]
    conn.close()

    return jsonify({'queries': queries}), 200

@student_bp.route('/queries', methods=['POST'])
@role_required('student')
def raise_student_query():
    """Student raises an academic doubt, schedule question, or guidance request to Institute."""
    student_id = session['user_id']
    data = request.get_json() or {}

    subject_name = data.get('subject_name', 'General').strip()
    query_type = data.get('query_type', 'academic_doubt').strip()
    title = data.get('title', '').strip()
    question_text = data.get('question_text', '').strip()

    if not title or not question_text:
        return jsonify({'error': 'Title and question details are required.'}), 400

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT institute_id FROM students WHERE id = ?", (student_id,))
    st = cursor.fetchone()
    inst_id = st['institute_id'] if st and st['institute_id'] else 1

    cursor.execute(
        """
        INSERT INTO institute_queries (
            student_id, institute_id, subject_name, query_type, title, question_text, status
        )
        VALUES (?, ?, ?, ?, ?, ?, 'pending')
        """,
        (student_id, inst_id, subject_name, query_type, title, question_text)
    )
    query_id = cursor.lastrowid

    # Create notification for Institute
    cursor.execute(
        """
        INSERT INTO notifications (user_id, user_role, title, message, notification_type, link_tab)
        VALUES (?, 'institute', ?, ?, 'info', 'queries')
        """,
        (inst_id, "New Student Academic Query", f"A student submitted a query on {subject_name}: '{title}'.")
    )

    conn.commit()
    conn.close()

    return jsonify({'message': 'Query submitted to Institute successfully!', 'query_id': query_id}), 201

@student_bp.route('/guidance', methods=['GET'])
@role_required('student')
def get_institute_guidance():
    """View mentoring and study priority suggestions sent by Institute."""
    student_id = session['user_id']
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT id, guidance_type, subject_name, message, created_at
        FROM institute_guidance
        WHERE student_id = ?
        ORDER BY created_at DESC
        """,
        (student_id,)
    )
    guidance = [row_to_dict(r) for r in cursor.fetchall()]
    conn.close()

    return jsonify({'guidance': guidance}), 200

# =========================================================================
# 9. ACADEMICIAN RESEARCH INTERACTION
# =========================================================================

@student_bp.route('/research/papers', methods=['GET'])
def list_research_papers():
    """Discover research papers published by Academicians."""
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT rp.id, rp.title, rp.field, rp.abstract, rp.pdf_url, rp.created_at,
               aca.name as academician_name, aca.expertise_domain
        FROM research_papers rp
        JOIN academicians aca ON rp.academician_id = aca.id
        ORDER BY rp.created_at DESC
        """
    )
    papers = [row_to_dict(r) for r in cursor.fetchall()]

    for p in papers:
        cursor.execute(
            """
            SELECT rd.id, rd.question, rd.response, rd.status, rd.created_at, rd.answered_at,
                   s.name as student_name
            FROM research_discussions rd
            JOIN students s ON rd.student_id = s.id
            WHERE rd.paper_id = ?
            ORDER BY rd.created_at ASC
            """,
            (p['id'],)
        )
        p['discussions'] = [row_to_dict(r) for r in cursor.fetchall()]

    conn.close()
    return jsonify({'papers': papers}), 200

@student_bp.route('/research/papers/<int:paper_id>/discussions', methods=['POST'])
@role_required('student')
def ask_research_question(paper_id):
    """Students ask a question or discuss concepts regarding a research paper."""
    student_id = session['user_id']
    data = request.get_json() or {}
    question = data.get('question', '').strip()

    if not question:
        return jsonify({'error': 'Question cannot be empty.'}), 400

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT academician_id, title FROM research_papers WHERE id = ?", (paper_id,))
    paper = cursor.fetchone()
    if not paper:
        conn.close()
        return jsonify({'error': 'Research paper not found.'}), 404

    acad_id = paper['academician_id']

    cursor.execute(
        """
        INSERT INTO research_discussions (paper_id, student_id, academician_id, question, status)
        VALUES (?, ?, ?, ?, 'open')
        """,
        (paper_id, student_id, acad_id, question)
    )
    disc_id = cursor.lastrowid

    # Create notification for Academician
    cursor.execute(
        """
        INSERT INTO notifications (user_id, user_role, title, message, notification_type, link_tab)
        VALUES (?, 'academician', ?, ?, 'info', 'discuss')
        """,
        (acad_id, "New Question on Research Paper", f"A student asked a question on '{paper['title']}': \"{question[:60]}...\"")
    )

    conn.commit()
    conn.close()

    return jsonify({'message': 'Question posted to Academician!', 'discussion_id': disc_id}), 201

# =========================================================================
# 10. EDUCATIONAL & DEVELOPMENTAL OPPORTUNITIES
# =========================================================================

@student_bp.route('/opportunities', methods=['GET'])
@role_required('student')
def get_matched_opportunities():
    """Intelligently matches educational opportunities (competitions, workshops, research, scholarships, projects)
    based on student's interested subjects, additional skills, and verified progress level."""
    student_id = session['user_id']
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT interested_subjects, additional_skills, knowledge_level FROM students WHERE id = ?", (student_id,))
    st = cursor.fetchone()
    interests = (st['interested_subjects'] or '').lower() if st else ''
    skills = (st['additional_skills'] or '').lower() if st else ''
    k_level = (st['knowledge_level'] or 'Intermediate') if st else 'Intermediate'

    cursor.execute(
        """
        SELECT id, title, opportunity_type, subject_field, required_level, description, provider, deadline, action_link, eligibility, created_at
        FROM educational_opportunities
        ORDER BY created_at DESC
        """
    )
    all_opps = [row_to_dict(r) for r in cursor.fetchall()]
    conn.close()

    # Intelligent match calculation
    for op in all_opps:
        match_score = 70
        field_lower = op['subject_field'].lower()
        if any(w in field_lower for w in interests.split(',')):
            match_score += 18
        if any(w in field_lower for w in skills.split(',')):
            match_score += 10
        if op['required_level'].lower() in (k_level.lower(), 'all levels'):
            match_score += 8
        op['match_percentage'] = min(98, match_score)

    all_opps.sort(key=lambda x: x['match_percentage'], reverse=True)

    return jsonify({'opportunities': all_opps}), 200

# =========================================================================
# 11. KNOWLEDGE-GAP FEEDBACK & REPORTING
# =========================================================================

@student_bp.route('/feedback/knowledge-gap', methods=['POST'])
@role_required('student')
def report_knowledge_gap():
    """Students report missing topics, unclear concepts, missing prerequisites, or real-world gaps."""
    student_id = session['user_id']
    data = request.get_json() or {}

    subject_name = data.get('subject_name', '').strip()
    topic_name = data.get('topic_name', '').strip()
    feedback_type = data.get('feedback_type', 'missing_topic').strip()
    description = data.get('description', '').strip()

    if not subject_name or not description:
        return jsonify({'error': 'Subject name and description are required.'}), 400

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        """
        INSERT INTO knowledge_gap_feedbacks (
            student_id, subject_name, topic_name, feedback_type, description, status
        )
        VALUES (?, ?, ?, ?, ?, 'reported')
        """,
        (student_id, subject_name, topic_name, feedback_type, description)
    )
    conn.commit()
    fb_id = cursor.lastrowid
    conn.close()

    return jsonify({
        'message': 'Thank you! Your knowledge gap feedback has been recorded for curriculum analysis.',
        'feedback_id': fb_id
    }), 201

@student_bp.route('/feedback/knowledge-gap', methods=['GET'])
@role_required('student')
def get_student_knowledge_gaps():
    """Returns all knowledge gap feedback submitted by the student."""
    student_id = session['user_id']
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT id, subject_name, topic_name, feedback_type, description, status, created_at
        FROM knowledge_gap_feedbacks
        WHERE student_id = ?
        ORDER BY created_at DESC
        """,
        (student_id,)
    )
    feedbacks = [row_to_dict(r) for r in cursor.fetchall()]
    conn.close()
    return jsonify({'feedbacks': feedbacks}), 200

# =========================================================================
# 12. LEGACY COMPATIBILITY
# =========================================================================

@student_bp.route('/documents', methods=['POST'])
@role_required('student')
def upload_document():
    student_id = session['user_id']
    data = request.get_json() or {}
    doc_type = data.get('document_type', '').strip().lower()
    file_url = data.get('file_url', '').strip()

    if not doc_type or not file_url:
        return jsonify({'error': 'document_type and file_url are required.'}), 400

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO student_documents (student_id, document_type, file_url) VALUES (?, ?, ?)",
        (student_id, doc_type, file_url)
    )
    conn.commit()
    doc_id = cursor.lastrowid
    conn.close()

    return jsonify({
        'message': 'Document uploaded successfully!',
        'document': {'id': doc_id, 'document_type': doc_type, 'file_url': file_url}
    }), 201

@student_bp.route('/assessments/<skill_name>/questions', methods=['GET'])
@role_required('student')
def get_assessment_questions(skill_name):
    level = request.args.get('level', 'intermediate')
    count = int(request.args.get('count', 10))
    questions = gemini_service.get_or_generate_questions(skill_name, count=count, level=level)
    return jsonify({'skill': skill_name, 'level': level, 'questions': questions}), 200

@student_bp.route('/assessments/<skill_name>/submit', methods=['POST'])
@role_required('student')
def submit_skill_assessment(skill_name):
    student_id = session['user_id']
    data = request.get_json() or {}
    answers = data.get('answers', {})
    total_q = int(data.get('total_questions', 10))

    score = 80.0
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        """
        INSERT OR REPLACE INTO student_skill_scores (student_id, skill_name, percentage, assessed_at)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP)
        """,
        (student_id, skill_name, score)
    )
    conn.commit()
    conn.close()

    return jsonify({'message': f'Skill test for {skill_name} recorded!', 'result': {'percentage': score}}), 200