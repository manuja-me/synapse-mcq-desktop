import { McqDeck } from '../types/mcq';

export const STARTER_DECKS: McqDeck[] = [
  {
    id: 'deck-systems-arch',
    title: 'Computer Systems & Memory Architecture',
    description: 'High-yield MCQs covering virtual memory, paging, cache coherence, and CPU scheduling.',
    created_at: Date.now() - 3600000 * 24,
    metadata: {
      difficulty: 'Balanced',
      total_questions: 5,
      target_audience: 'Undergraduate Computer Science',
      source: 'Operating Systems Principles'
    },
    questions: [
      {
        id: 1,
        question: "In a paging memory management system, what is the primary purpose of the Translation Lookaside Buffer (TLB)?",
        options: [
          "To cache recently accessed physical data blocks from disk",
          "To cache virtual-to-physical address translations and minimize page table lookups",
          "To synchronize dirty cache lines between multiple CPU cores",
          "To reorder machine instructions for out-of-order execution"
        ],
        correct_answer: 1,
        explanation: "The TLB is a fast, hardware associative cache that stores recently resolved virtual-to-physical page frame mappings, drastically reducing the effective memory access time.",
        distractor_explanations: [
          "Disk caching is handled by the OS buffer/page cache in RAM, not the CPU TLB.",
          "Correct answer.",
          "Cache coherence protocols (e.g. MESI) handle multi-core cache synchronization, not the TLB.",
          "Out-of-order execution reordering is performed by the CPU reservation stations and reorder buffer (ROB)."
        ],
        topic: "Virtual Memory",
        difficulty: "medium",
        tags: ["TLB", "Hardware", "Paging"]
      },
      {
        id: 2,
        question: "Which cache write policy guarantees that main memory always contains the most up-to-date copy of cached data at the cost of higher bus traffic?",
        options: [
          "Write-Back with Write-Allocate",
          "Write-Through",
          "Lazy Write-Buffer Invalidation",
          "Write-Around without Invalidation"
        ],
        correct_answer: 1,
        explanation: "In a Write-Through policy, every write operation to the cache is simultaneously propagated to main memory, ensuring immediate consistency at the expense of write latency and bus bandwidth.",
        distractor_explanations: [
          "Write-back updates main memory only when the dirty cache line is evicted.",
          "Correct answer.",
          "Lazy write schemes defer memory writes and do not ensure immediate up-to-date memory.",
          "Write-around bypasses cache on write miss but does not guarantee continuous memory consistency during hits."
        ],
        topic: "Cache Hierarchies",
        difficulty: "easy",
        tags: ["Caches", "Architecture"]
      },
      {
        id: 3,
        question: "Under the MESI cache coherence protocol, what state transitions occur when a core reads a block that is currently in the 'Exclusive' state on another core?",
        options: [
          "The state on the original core transitions to 'Shared', and the reading core also enters 'Shared'",
          "The block on the original core is immediately invalidated to 'Invalid'",
          "Both cores transition to 'Modified' to reflect dual ownership",
          "The bus generates an atomic lock and aborts the second core's read cycle"
        ],
        correct_answer: 0,
        explanation: "When Core A holds a line in Exclusive (unmodified, owned only by A) and Core B attempts to read it, Core A snoops the bus, notices the read, and both cores downgrade/transition to the Shared (S) state.",
        distractor_explanations: [
          "Correct answer.",
          "Invalidation occurs on write attempts (read-with-intent-to-modify), not clean read operations.",
          "Modified denotes that the line is dirty and exclusively held by one core; two cores cannot be Modified simultaneously.",
          "Atomic bus locks are reserved for explicit atomic instructions (e.g. LOCK CMPXCHG), not standard coherent reads."
        ],
        topic: "Multiprocessing",
        difficulty: "hard",
        tags: ["MESI", "Concurrency", "Cache Coherence"]
      },
      {
        id: 4,
        question: "What is Belady's Anomaly in the context of page replacement algorithms?",
        options: [
          "A phenomenon where increasing the number of page frames leads to an increase in page faults",
          "A bug where high memory pressure causes continuous thrashing between swap space and RAM",
          "The inability of an LRU algorithm to maintain optimal hit rates during cyclic loops",
          "The deadlock that occurs when two threads wait indefinitely on mutual page faults"
        ],
        correct_answer: 0,
        explanation: "Belady's Anomaly describes the counter-intuitive behavior exhibited by certain non-stack page replacement algorithms (such as FIFO) where allocating more physical page frames results in more page faults for a given reference string.",
        distractor_explanations: [
          "Correct answer.",
          "Continuous swapping under memory pressure is simply called thrashing.",
          "LRU is a stack algorithm and is mathematically immune to Belady's Anomaly.",
          "Deadlock between threads is synchronization concurrency, unrelated to Belady's finding."
        ],
        topic: "Page Replacement",
        difficulty: "medium",
        tags: ["FIFO", "Belady", "Virtual Memory"]
      },
      {
        id: 5,
        question: "Which condition is NOT one of Coffman's four necessary conditions for deadlock to occur in an operating system?",
        options: [
          "Mutual Exclusion",
          "Hold and Wait",
          "Preemption",
          "Circular Wait"
        ],
        correct_answer: 2,
        explanation: "The condition is NO PREEMPTION (resources cannot be forcibly taken away from a process). If preemption is allowed, deadlock cannot occur.",
        distractor_explanations: [
          "Mutual exclusion is one of the four necessary Coffman conditions.",
          "Hold and wait is one of the four necessary Coffman conditions.",
          "Correct answer: the requirement is 'No Preemption', not 'Preemption'.",
          "Circular wait is the final necessary Coffman condition."
        ],
        topic: "Deadlocks & Concurrency",
        difficulty: "easy",
        tags: ["Operating Systems", "Deadlock"]
      }
    ]
  },
  {
    id: 'deck-neural-foundations',
    title: 'Deep Learning & Attention Mechanisms',
    description: 'Foundational concepts in Transformer architecture, self-attention complexity, and normalization.',
    created_at: Date.now() - 3600000 * 12,
    metadata: {
      difficulty: 'Hard',
      total_questions: 3,
      target_audience: 'Graduate / AI Researcher',
      source: 'Attention Is All You Need & Modern NLP'
    },
    questions: [
      {
        id: 1,
        question: "In the standard scaled dot-product attention formula $\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V$, why is the dot-product divided by $\\sqrt{d_k}$?",
        options: [
          "To enforce unitary norm across the output matrix projections",
          "To counter the growth of the dot product magnitude for large dimensions and prevent vanishing softmax gradients",
          "To reduce computational complexity from quadratic to sub-linear time",
          "To eliminate cross-entropy loss fluctuations during backpropagation"
        ],
        correct_answer: 1,
        explanation: "For large values of dimension $d_k$, the dot products grow large in magnitude, pushing the softmax function into regions where it has extremely small gradients. Scaling by $1/\\sqrt{d_k}$ stabilizes the variance to 1 and keeps gradients healthy.",
        distractor_explanations: [
          "Unitary norm is not enforced by this scaling factor.",
          "Correct answer.",
          "Scaling by a scalar has zero impact on the $O(N^2)$ asymptotic complexity of attention.",
          "Softmax scaling stabilizes layer activations, not overall loss calculation."
        ],
        topic: "Transformers",
        difficulty: "hard",
        tags: ["Attention", "Softmax", "Deep Learning"]
      },
      {
        id: 2,
        question: "Why is Layer Normalization generally preferred over Batch Normalization in autoregressive sequence modeling?",
        options: [
          "LayerNorm requires calculating running averages across mini-batches during inference",
          "LayerNorm normalizes across feature dimensions independently for each individual token without batch dependency",
          "Batch Normalization requires $O(N^3)$ matrix inversions on sequential sequences",
          "Layer Normalization acts as an explicit dropout regularizer"
        ],
        correct_answer: 1,
        explanation: "Layer Normalization computes the mean and variance across the hidden channel dimensions for each sample independently, meaning it does not depend on other examples in the batch and works seamlessly with variable sequence lengths and batch size = 1.",
        distractor_explanations: [
          "BatchNorm uses running statistics across mini-batches; LayerNorm does not need running batch statistics.",
          "Correct answer.",
          "BatchNorm is linear in sequence length, not $O(N^3)$.",
          "LayerNorm stabilizes activation distributions; it is not a stochastic dropout mask."
        ],
        topic: "Normalization Techniques",
        difficulty: "medium",
        tags: ["LayerNorm", "BatchNorm", "Architectures"]
      },
      {
        id: 3,
        question: "What is the primary architectural difference between RoPE (Rotary Position Embedding) and traditional Sinusoidal Absolute Position Embeddings?",
        options: [
          "RoPE incorporates relative positional distances through multiplicative complex rotation in the 2D affine subspaces",
          "RoPE requires twice as many trainable parameter weights in the embedding layer",
          "Sinusoidal embeddings cannot extrapolate beyond context lengths of 512 tokens",
          "RoPE replaces the key-value projection weights with orthogonal matrices"
        ],
        correct_answer: 0,
        explanation: "RoPE encodes relative position by rotating the query and key vectors in complex 2D vector pairs such that their dot product depends solely on the relative displacement $(m - n)$ between token positions.",
        distractor_explanations: [
          "Correct answer.",
          "RoPE is completely parameter-free; it has zero trainable weights.",
          "Sinusoidal embeddings can mathematically compute any index, though empirical generalization degrades.",
          "RoPE does not alter projection weight matrices; it rotates the projected vectors."
        ],
        topic: "Positional Encodings",
        difficulty: "hard",
        tags: ["RoPE", "Embeddings", "LLM"]
      }
    ]
  },
  {
    id: 'deck-systems-theory-flashcards',
    title: 'Operating Systems & Distributed Theory',
    deck_type: 'flashcard',
    description: 'High-yield theoretical principles: Coffman conditions, ACID invariants, CAP theorem, and memory hierarchy laws.',
    created_at: Date.now() - 3600000 * 12,
    metadata: {
      difficulty: 'Balanced',
      total_cards: 6,
      target_audience: 'Undergraduate / Systems Engineers',
      source: 'Classic Distributed Systems & OS Theory'
    },
    questions: [],
    cards: [
      {
        id: 1,
        front: "What are the four necessary Coffman conditions required for a deadlock to occur?",
        back: [
          "Mutual Exclusion: At least one resource must be held in a non-shareable mode.",
          "Hold and Wait: A process holds resources while waiting for additional allocations.",
          "No Preemption: Resources cannot be forcibly expropriated from a process holding them.",
          "Circular Wait: A closed loop of processes exists where each process waits for a resource held by the next."
        ],
        explanation: "Eliminating any single one of these four conditions mathematically guarantees prevention of deadlocks (e.g. strict resource ordering eliminates circular wait).",
        topic: "Concurrency Theory",
        difficulty: "medium",
        tags: ["Deadlock", "Coffman", "Concurrency"]
      },
      {
        id: 2,
        front: "State and define the four ACID properties of transactional database systems.",
        back: [
          "Atomicity: Transactions execute as an all-or-nothing unit of work; partial execution is rolled back.",
          "Consistency: Transactions transition the database from one valid state satisfying all invariants to another.",
          "Isolation: Concurrent execution yields system states equivalent to serial (sequential) execution.",
          "Durability: Once committed, state changes survive any subsequent hardware failure or crash."
        ],
        explanation: "ACID guarantees data validity despite power failures, crashes, and concurrent interleaved access.",
        topic: "Database Systems",
        difficulty: "easy",
        tags: ["ACID", "Transactions", "Databases"]
      },
      {
        id: 3,
        front: "What is the CAP Theorem (Brewer's Conjecture) in distributed computing?",
        back: [
          "Consistency (Linearizability): Every read receives the most recent write or an error.",
          "Availability: Every non-failing node returns a non-error response for every received request (no latency guarantees).",
          "Partition Tolerance: The system continues to operate despite arbitrary message loss or network partitions."
        ],
        explanation: "Because physical network partitions cannot be avoided in distributed networks, systems must fundamentally trade off between CP and AP during network disruptions.",
        topic: "Distributed Systems",
        difficulty: "medium",
        tags: ["CAP", "Distributed", "Consensus"]
      },
      {
        id: 4,
        front: "Define the Principle of Locality in memory hierarchies and explain its two dimensions.",
        back: [
          "Temporal Locality: If a specific memory location is referenced, it is highly likely to be referenced again in the near future (e.g. loop iterations, stack pointers).",
          "Spatial Locality: If a specific memory location is referenced, memory locations with proximate addresses are likely to be accessed soon (e.g. array traversals, sequential instruction fetches)."
        ],
        explanation: "Caches, TLBs, and hardware prefetchers exploit these two statistical behaviors to achieve low effective memory access latency.",
        topic: "Memory Systems",
        difficulty: "easy",
        tags: ["Locality", "Cache", "Memory"]
      },
      {
        id: 5,
        front: "What is the difference between Preemptive and Non-Preemptive CPU Scheduling?",
        back: [
          "Preemptive Scheduling: The OS kernel can interrupt a running process and reallocate CPU cycles to another runnable process based on priorities or quantum expiration (e.g. Round Robin, Multi-Level Feedback Queue).",
          "Non-Preemptive Scheduling: A process retains CPU control until it voluntarily yields, requests blocking I/O, or terminates (e.g. First-Come First-Served, Shortest Job First without preemption)."
        ],
        explanation: "Preemptive scheduling prevents rogue or monopolizing compute loops from hanging interactive operating environments.",
        topic: "CPU Scheduling",
        difficulty: "medium",
        tags: ["Scheduling", "Kernel", "CPU"]
      },
      {
        id: 6,
        front: "What is Belady's Anomaly and under which algorithmic condition can it occur?",
        back: "Belady's Anomaly is the counter-intuitive phenomenon where increasing the number of physical page frames results in an increased number of page faults for a reference string. It occurs exclusively in non-stack page replacement algorithms (such as First-In, First-Out).",
        explanation: "Stack-based algorithms (such as LRU and Optimal MIN) are mathematically immune to Belady's Anomaly because the set of pages in an n-frame cache is always a strict subset of the pages in an (n+1)-frame cache.",
        topic: "Virtual Memory",
        difficulty: "hard",
        tags: ["Belady", "Paging", "FIFO"]
      }
    ]
  }
];
