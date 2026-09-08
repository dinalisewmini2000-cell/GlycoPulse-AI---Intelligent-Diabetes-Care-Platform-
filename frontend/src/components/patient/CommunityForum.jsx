import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  MessageSquare, Heart, Plus, Search, BookOpen, Share2, 
  Send, User, CheckCircle2, Sparkles, Filter, X, ThumbsUp, 
  Clock, ShieldCheck, Tag, ChefHat, Activity, Award
} from 'lucide-react';
import { 
  subscribeCommunityPosts, 
  saveCommunityPostToFirestore, 
  updateCommunityPostInFirestore 
} from '../../services/firebase';

// Initial pre-seeded clinical & patient community posts
const SEED_COMMUNITY_POSTS = [
  {
    id: 'post-1',
    authorName: 'Dr. A. Samarasinghe',
    authorRole: 'Verified Endocrinologist',
    category: 'Diet Tips',
    title: 'Switching to Heirloom Rice Varieties reduced my patients’ post-meal glucose spikes by 30%',
    content: 'Traditional Sri Lankan rice varieties like Suwandel and Kalu Heenati have significantly lower Glycemic Index (GI ~50) compared to polished white rice (GI ~73). When paired with leafy green mallum (Gotukola/Kankun) and dhal, glucose absorption is slowed down naturally.',
    likesCount: 38,
    likedBy: [],
    timestamp: '2 hours ago',
    comments: [
      { id: 'c1', authorName: 'Kasun Perera', authorRole: 'Patient - T1D', text: 'Doctor, where can we consistently buy authentic Suwandel rice in Colombo?', timestamp: '1 hour ago' },
      { id: 'c2', authorName: 'Dr. A. Samarasinghe', authorRole: 'Verified Endocrinologist', text: 'Hi Kasun! Most organic markets and major supermarket chains now stock certified Suwandel rice. Look for low-GI certification on the package.', timestamp: '45 mins ago' }
    ]
  },
  {
    id: 'post-2',
    authorName: 'Sanduni Malwatte',
    authorRole: 'Patient - T2D (HbA1c dropped from 8.4% to 6.2%)',
    category: 'Success Story',
    title: 'My 6-month journey dropping HbA1c from 8.4% to 6.2% without extreme starvation!',
    content: 'Consistency was key for me. I started logging every meal using GlycoPulse AI, walked 30 minutes every evening after dinner, and swapped refined flour rotis with Kurakkan millet flatbreads. The progress charts kept me motivated!',
    likesCount: 54,
    likedBy: [],
    timestamp: '5 hours ago',
    comments: [
      { id: 'c3', authorName: 'Nimal Jayasinghe', authorRole: 'Patient', text: 'Inspirational! Did you experience any midnight hypos when you started evening walks?', timestamp: '3 hours ago' },
      { id: 'c4', authorName: 'Sanduni Malwatte', authorRole: 'Patient', text: 'Hi Nimal! I always check my blood sugar before walking. If it is under 100 mg/dL, I take a small snack like 10 almonds or 1/2 guava.', timestamp: '2 hours ago' }
    ]
  },
  {
    id: 'post-3',
    authorName: 'Anusha De Silva',
    authorRole: 'Diabetic Nutritionist',
    category: 'Daily Motivation',
    title: 'Remember: One high glucose reading is data, not a failure!',
    content: 'Do not feel discouraged if your sugar reads high after a family event or wedding meal. Use the reading to understand how your body reacts to specific foods, stay hydrated with 2.5L water, and get back to your routine meal timing.',
    likesCount: 42,
    likedBy: [],
    timestamp: '1 day ago',
    comments: [
      { id: 'c5', authorName: 'Dilshan K.', authorRole: 'Patient - T1D', text: 'Thank you Anusha! Needed to hear this today after last night’s spike.', timestamp: '18 hours ago' }
    ]
  },
  {
    id: 'post-4',
    authorName: 'Rohan Pathirana',
    authorRole: 'Patient - T1D 8 yrs',
    category: 'Ask Question',
    title: 'How do you handle Dawn Phenomenon when fasting sugar is high despite low bedtime sugar?',
    content: 'My bedtime glucose is usually around 110 mg/dL, but when I wake up at 7:00 AM it jumps to 165 mg/dL without eating anything. Has anyone managed this effectively with bedtime protein snacks?',
    likesCount: 29,
    likedBy: [],
    timestamp: '2 days ago',
    comments: [
      { id: 'c6', authorName: 'Dr. A. Samarasinghe', authorRole: 'Verified Endocrinologist', text: 'Dawn phenomenon is caused by counter-regulatory hormones (cortisol, growth hormone) released in early morning hours. A small bedtime protein snack like 120g low-fat curd or a boiled egg often suppresses overnight liver gluconeogenesis.', timestamp: '1 day ago' }
    ]
  }
];

// Curated Clinical Educational Guides & Recipes
const CLINICAL_GUIDES = [
  {
    id: 'guide-1',
    title: 'Managing Glycemic Index in Sri Lankan Rice Varieties',
    category: 'Nutrition & GI',
    readTime: '4 min read',
    icon: ChefHat,
    color: '#0284c7',
    summary: 'A complete breakdown of Glycemic Index (GI) values for Sri Lankan rice types, portion control tips, and fiber pairing strategies.',
    fullContent: `
### Glycemic Index Comparison of Sri Lankan Rice Varieties

Not all rice affects blood glucose equally. The processing method and starch structure significantly determine how fast glucose enters your bloodstream:

1. **Suwandel Rice (GI ~50 - Low)**: An ancient heirloom rice rich in antioxidants. Digesting slowly, it provides sustained energy without sharp glucose spikes.
2. **Kalu Heenati Rice (GI ~52 - Low)**: High in fiber and micronutrients, ideal for Type 1 and Type 2 diabetes management.
3. **Red Raw Rice (GI ~55-60 - Low/Medium)**: Unpolished bran layer slows starch digestion. Far superior to white rice.
4. **Polished White Samba / Kakulu (GI ~73 - High)**: Rapidly absorbed, causing fast post-prandial glucose surges.

### Clinical Plate Portion Guidelines:
- **Half the Plate (50%)**: Non-starchy green leafy vegetables (Gotukola, Kankun, Mukunuwenna, Cucumber, Bitter Gourd).
- **Quarter Plate (25%)**: Lean protein (Fish, Chicken Breast, Eggs, Dhal / Red Lentils, Tofu).
- **Quarter Plate (25%)**: Unpolished low-GI rice (1 cup cooked = ~150g).
    `
  },
  {
    id: 'guide-2',
    title: 'Preventing Dawn Phenomenon & Overnight Hypoglycemia',
    category: 'Clinical Guidance',
    readTime: '5 min read',
    icon: Activity,
    color: '#2563eb',
    summary: 'Understanding early morning blood sugar spikes, Somogyi effect vs Dawn phenomenon, and night snack protocols.',
    fullContent: `
### What is the Dawn Phenomenon?

The Dawn Phenomenon refers to an abnormal early-morning surge in blood glucose (typically between 3:00 AM and 8:00 AM). 

**Root Cause**: Natural circadian surge of counter-regulatory hormones (cortisol, growth hormone, glucagon, and epinephrine) that signal the liver to release stored glucose into the bloodstream.

### How to Differentiate: Dawn Phenomenon vs Somogyi Effect

Check your blood sugar at **3:00 AM**:
- If 3:00 AM reading is **High or Normal** -> **Dawn Phenomenon** (Body needs dose adjustment or bedtime protein snack).
- If 3:00 AM reading is **Low (<70 mg/dL)** -> **Somogyi Effect** (Rebound spike triggered by nocturnal hypoglycemia. Requires lower evening insulin/medication).

### Recommended Bedtime Snack Protocol:
- **120g Low-fat Curd / Greek Yogurt** with 1 tbsp soaked chia seeds.
- **1 Hard-boiled Egg** with cucumber slices.
- **15 Raw Unsalted Almonds**.
    `
  },
  {
    id: 'guide-3',
    title: 'Safe Exercises & Activity Guidelines During High Sugar (>250 mg/dL)',
    category: 'Exercise & Safety',
    readTime: '6 min read',
    icon: ShieldCheck,
    color: '#dc2626',
    summary: 'Safety protocol when exercising with elevated blood glucose levels and ketone testing rules.',
    fullContent: `
### Exercise Safety Rules for Diabetics

Physical activity generally lowers blood glucose by enhancing muscle insulin sensitivity. However, exercising when blood glucose is excessively high can be dangerous!

### Protocol when Blood Sugar is Over 250 mg/dL:

1. **Check for Ketones First**: If blood sugar is >250 mg/dL, test for blood or urine ketones.
2. **If Ketones are Present**: **DO NOT EXERCISE!** Strenuous activity will cause stress hormones to spike glucose even higher and risk Diabetic Ketoacidosis (DKA). Hydrate and contact your physician.
3. **If Ketones are Negative**: Moderate low-impact walking is safe. Drink 500ml water and recheck glucose in 30 minutes.

### Ideal Workout Conditions:
- Pre-exercise target glucose: **100 - 180 mg/dL**.
- Always carry fast-acting glucose tablets or 15g sugar snack in case of rapid drops.
    `
  },
  {
    id: 'guide-4',
    title: 'Diabetic-Friendly Sri Lankan Dhal & Coconut Curry Recipe Guide',
    category: 'Diabetic Recipes',
    readTime: '3 min read',
    icon: ChefHat,
    color: '#059669',
    summary: 'High-fiber, low-fat coconut milk substitution recipes for traditional lentil and vegetable curries.',
    fullContent: `
### Low-GI Diabetic Dhal & Coconut Curry Recipe

Traditional dhal curry is rich in plant protein and soluble fiber. By substituting thick coconut cream with thin coconut milk and adding anti-inflammatory spices, you get a delicious, blood-sugar friendly meal!

### Ingredients (4 Servings):
- **Red Lentils (Dhal)**: 150g (rinsed & soaked)
- **Thin Coconut Milk**: 120ml (diluted with water)
- **Turmeric Powder**: 1 tsp (contains curcumin to improve insulin sensitivity)
- **Garlic & Ginger**: 4 cloves minced
- **Fenugreek Seeds (Methi)**: 1/2 tsp (proven to reduce glycemic index)
- **Curry Leaves & Mustard Seeds**: 1 tsp for tempering in 1 tsp virgin coconut oil

### Preparation Steps:
1. Boil red lentils with turmeric, garlic, sliced green chilies, and fenugreek seeds until tender.
2. Add thin coconut milk and simmer on low heat for 5 minutes.
3. In a separate pan, temper mustard seeds and curry leaves in 1 tsp coconut oil for 30 seconds and mix into curry.
4. **Nutritional Info per serving**: ~160 kcal, 20g Carbs, 9g Protein, 4g Fat, 6g Fiber.
    `
  },
  {
    id: 'guide-5',
    title: 'Understanding HbA1c Lab Readings & Target Ranges',
    category: 'Clinical Guidance',
    readTime: '5 min read',
    icon: BookOpen,
    color: '#7c3aed',
    summary: 'What glycated hemoglobin measures, converting HbA1c to average blood glucose, and target guidelines.',
    fullContent: `
### What is an HbA1c Test?

HbA1c (Hemoglobin A1c) measures the percentage of red blood cells attached to glucose over their 90-120 day lifespan. It provides an accurate average of your overall blood sugar control over the preceding 2-3 months.

### Diagnostic Criteria:
- **Normal**: Below 5.7%
- **Prediabetes**: 5.7% to 6.4%
- **Diabetes**: 6.5% or higher

### Clinical Target Benchmarks:
- **General Diabetic Target**: Below **7.0%** (Estimated Average Glucose ~154 mg/dL).
- **Elderly / Hypo-prone Target**: **7.5% - 8.0%**.

### eAG (Estimated Average Glucose) Conversion Formula:
$$\\text{eAG (mg/dL)} = 28.7 \\times \\text{HbA1c} - 46.7$$

Maintaining your HbA1c below 7.0% significantly reduces risk of diabetic microvascular complications (retinopathy, neuropathy, nephropathy) by over 40%!
    `
  }
];

export const CommunityForum = () => {
  const { currentUser, setToastAlert } = useApp();

  // Active Main Section Tab: 'forum' | 'knowledge'
  const [activeMainTab, setActiveMainTab] = useState('forum');

  // Loading state for Firebase community posts
  const [loading, setLoading] = useState(true);

  // Community Posts State (Populated from Firestore or seed fallback)
  const [posts, setPosts] = useState(SEED_COMMUNITY_POSTS);
  const [postCategoryFilter, setPostCategoryFilter] = useState('All');
  const [searchPostQuery, setSearchPostQuery] = useState('');

  // Modal State for New Post Creation
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [newPostCategory, setNewPostCategory] = useState('Success Story');
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');

  // Active Comment Box State (Map of postId -> expanded boolean)
  const [expandedComments, setExpandedComments] = useState({});
  const [newCommentInputs, setNewCommentInputs] = useState({});

  // Knowledge Hub State
  const [knowledgeFilter, setKnowledgeFilter] = useState('All');
  const [searchKnowledgeQuery, setSearchKnowledgeQuery] = useState('');
  const [selectedGuideModal, setSelectedGuideModal] = useState(null);

  // Firestore Real-time Listener
  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeCommunityPosts((cloudPosts) => {
      try {
        if (cloudPosts && Array.isArray(cloudPosts) && cloudPosts.length > 0) {
          // Merge cloud posts with seed posts to ensure vibrant demonstration
          const combined = [...cloudPosts];
          SEED_COMMUNITY_POSTS.forEach(sp => {
            if (!combined.some(cp => cp.id === sp.id)) {
              combined.push(sp);
            }
          });
          setPosts(combined);
        } else if (cloudPosts && Array.isArray(cloudPosts)) {
          setPosts(cloudPosts.length === 0 ? SEED_COMMUNITY_POSTS : cloudPosts);
        } else {
          setPosts(SEED_COMMUNITY_POSTS || []);
        }
      } catch (err) {
        console.warn('[CommunityForum Subscription Error]:', err);
        setPosts(SEED_COMMUNITY_POSTS || []);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Handle Create New Community Post
  const handleCreatePostSubmit = async (e) => {
    e.preventDefault();
    if (!newPostTitle.trim() || !newPostContent.trim()) return;

    const authorName = currentUser?.name || (currentUser?.email ? currentUser.email.split('@')[0] : 'Patient User');
    const authorRole = currentUser?.role === 'doctor' ? 'Verified Clinician' : 'Patient Community Member';

    const newPostObj = {
      authorName,
      authorRole,
      userId: currentUser?.uid || currentUser?.id,
      userEmail: currentUser?.email,
      category: newPostCategory,
      title: newPostTitle.trim(),
      content: newPostContent.trim(),
      likesCount: 0,
      likedBy: [],
      timestamp: 'Just now',
      comments: []
    };

    // Optimistic UI Update
    setPosts(prev => [{ id: 'post-' + Date.now(), ...newPostObj }, ...(Array.isArray(prev) ? prev : [])]);

    // Save to Firebase Firestore
    await saveCommunityPostToFirestore(newPostObj);

    // Reset Form
    setNewPostTitle('');
    setNewPostContent('');
    setIsPostModalOpen(false);

    if (setToastAlert) {
      setToastAlert({
        type: 'success',
        title: 'Post Published',
        message: 'Your post was shared with the GlycoPulse community!'
      });
    }
  };

  // Toggle Like Reaction
  const handleToggleLike = async (post) => {
    if (!post) return;
    const userEmail = currentUser?.email || 'user';
    const hasLiked = (post.likedBy || []).includes(userEmail);

    const updatedLikesCount = hasLiked ? Math.max(0, (post.likesCount || 0) - 1) : (post.likesCount || 0) + 1;
    const updatedLikedBy = hasLiked
      ? (post.likedBy || []).filter(e => e !== userEmail)
      : [...(post.likedBy || []), userEmail];

    // Optimistic Update
    setPosts(prev => (Array.isArray(prev) ? prev : []).map(p => {
      if (p?.id === post.id) {
        return { ...p, likesCount: updatedLikesCount, likedBy: updatedLikedBy };
      }
      return p;
    }));

    // Firestore Update if doc exists
    if (post.id && !post.id.startsWith('post-seed')) {
      await updateCommunityPostInFirestore(post.id, {
        likesCount: updatedLikesCount,
        likedBy: updatedLikedBy
      });
    }
  };

  // Toggle Comment Thread Expansion
  const toggleCommentsExpand = (postId) => {
    if (!postId) return;
    setExpandedComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  // Add Comment to Post
  const handleAddComment = async (post) => {
    if (!post) return;
    const text = (newCommentInputs[post.id] || '').trim();
    if (!text) return;

    const commentObj = {
      id: 'c-' + Date.now(),
      authorName: currentUser?.name || (currentUser?.email ? currentUser.email.split('@')[0] : 'Patient User'),
      authorRole: currentUser?.role === 'doctor' ? 'Verified Clinician' : 'Patient',
      text,
      timestamp: 'Just now'
    };

    const updatedComments = [...(post.comments || []), commentObj];

    // Optimistic Update
    setPosts(prev => (Array.isArray(prev) ? prev : []).map(p => {
      if (p?.id === post.id) {
        return { ...p, comments: updatedComments };
      }
      return p;
    }));

    setNewCommentInputs(prev => ({ ...prev, [post.id]: '' }));

    // Firestore Update
    if (post.id && !post.id.startsWith('post-seed')) {
      await updateCommunityPostInFirestore(post.id, { comments: updatedComments });
    }
  };

  // Filtered Community Posts (With safe optional chaining)
  const safePosts = Array.isArray(posts) ? posts : [];
  const filteredPosts = safePosts.filter((p) => {
    if (!p) return false;
    const matchesCat = postCategoryFilter === 'All' || p.category === postCategoryFilter;
    const matchesSearch = !searchPostQuery.trim() || 
      (p.title || '').toLowerCase().includes(searchPostQuery.toLowerCase()) || 
      (p.content || '').toLowerCase().includes(searchPostQuery.toLowerCase()) ||
      (p.authorName || '').toLowerCase().includes(searchPostQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Filtered Knowledge Guides
  const filteredGuides = CLINICAL_GUIDES.filter((g) => {
    const matchesCat = knowledgeFilter === 'All' || g.category === knowledgeFilter;
    const matchesSearch = !searchKnowledgeQuery.trim() ||
      g.title.toLowerCase().includes(searchKnowledgeQuery.toLowerCase()) ||
      g.summary.toLowerCase().includes(searchKnowledgeQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '960px', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
            <MessageSquare size={24} color="#0284c7" />
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.02em' }}>
              Diabetes Community & Clinical Knowledge Hub
            </h1>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: 0 }}>
            Peer support discussions, clinical doctor guidance, patient success stories, and verified diabetic care guides.
          </p>
        </div>

        {/* Top Navigation Tabs */}
        <div style={{ display: 'flex', gap: '0.4rem', background: '#f1f5f9', padding: '0.3rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <button
            type="button"
            onClick={() => setActiveMainTab('forum')}
            style={{
              padding: '0.55rem 1.1rem',
              borderRadius: '8px',
              border: 'none',
              background: activeMainTab === 'forum' ? '#0284c7' : 'transparent',
              color: activeMainTab === 'forum' ? '#ffffff' : '#64748b',
              fontWeight: 800,
              fontSize: '0.86rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              transition: 'all 0.15s ease'
            }}
          >
            <MessageSquare size={16} />
            <span>Community Forum</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMainTab('knowledge')}
            style={{
              padding: '0.55rem 1.1rem',
              borderRadius: '8px',
              border: 'none',
              background: activeMainTab === 'knowledge' ? '#0284c7' : 'transparent',
              color: activeMainTab === 'knowledge' ? '#ffffff' : '#64748b',
              fontWeight: 800,
              fontSize: '0.86rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              transition: 'all 0.15s ease'
            }}
          >
            <BookOpen size={16} />
            <span>Clinical Guides & Recipes</span>
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* TAB 1: COMMUNITY DISCUSSION FORUM */}
      {/* ==================================================================== */}
      {activeMainTab === 'forum' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Action Bar: Search, Category Filters, New Post Button */}
          <div className="glass-panel" style={{ padding: '1.2rem', background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
              
              {/* Search Bar */}
              <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.45rem 0.75rem', flex: 1, minWidth: '220px' }}>
                <Search size={16} color="#64748b" style={{ marginRight: '0.45rem' }} />
                <input
                  type="text"
                  placeholder="Search discussion topics, questions or authors..."
                  value={searchPostQuery}
                  onChange={e => setSearchPostQuery(e.target.value)}
                  style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', fontSize: '0.86rem', color: '#0f172a' }}
                />
              </div>

              {/* Create Post Button */}
              <button
                type="button"
                onClick={() => setIsPostModalOpen(true)}
                className="btn-primary"
                style={{
                  padding: '0.6rem 1.2rem',
                  fontSize: '0.86rem',
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #0284c7, #2563eb)',
                  border: 'none',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  cursor: 'pointer'
                }}
              >
                <Plus size={17} />
                <span>Create New Post</span>
              </button>
            </div>

            {/* Category Filter Pills */}
            <div style={{ display: 'flex', gap: '0.45rem', overflowX: 'auto', paddingBottom: '0.15rem' }}>
              {['All', 'Success Story', 'Diet Tips', 'Ask Question', 'Daily Motivation'].map((cat) => {
                const isActive = postCategoryFilter === cat;
                const catCount = cat === 'All' ? posts.length : posts.filter(p => p.category === cat).length;

                return (
                  <button
                    key={cat}
                    onClick={() => setPostCategoryFilter(cat)}
                    style={{
                      padding: '0.35rem 0.8rem',
                      borderRadius: '6px',
                      border: isActive ? '1px solid #0284c7' : '1px solid #cbd5e1',
                      background: isActive ? '#0284c7' : '#ffffff',
                      color: isActive ? '#ffffff' : '#475569',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}
                  >
                    <span>{cat}</span>
                    <span style={{ background: isActive ? 'rgba(255,255,255,0.25)' : '#f1f5f9', padding: '0.05rem 0.35rem', borderRadius: '4px', fontSize: '0.68rem' }}>
                      {catCount}
                    </span>
                  </button>
                );
              })}
            </div>

          </div>

          {/* Posts Feed List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {loading ? (
              <div className="glass-panel" style={{ padding: '3rem 1rem', textAlign: 'center', background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                <Clock size={30} color="#0284c7" className="spin-icon" style={{ animation: 'spin 1s linear infinite' }} />
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>Loading community discussions...</div>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center', background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                <MessageSquare size={36} color="#94a3b8" />
                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>No posts yet. Be the first to post!</h4>
                <p style={{ fontSize: '0.84rem', color: '#64748b', margin: 0 }}>Share your journey, ask a question, or give advice to fellow patients.</p>
                <button
                  type="button"
                  onClick={() => setIsPostModalOpen(true)}
                  className="btn-primary"
                  style={{ marginTop: '0.5rem', padding: '0.6rem 1.2rem', fontSize: '0.86rem', background: '#0284c7', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Plus size={16} />
                  <span>Create New Post</span>
                </button>
              </div>
            ) : (
              filteredPosts.map((post) => {
                if (!post) return null;
                const userEmail = currentUser?.email || 'user';
                const isLiked = (post.likedBy || []).includes(userEmail);
                const commentsCount = (post.comments || []).length;
                const isCommentsOpen = !!expandedComments[post.id];

                const catBadgeStyles = {
                  'Success Story': { bg: '#dcfce7', color: '#15803d', border: '#86efac' },
                  'Diet Tips': { bg: '#e0f2fe', color: '#0369a1', border: '#7dd3fc' },
                  'Ask Question': { bg: '#fffbeb', color: '#b45309', border: '#fde68a' },
                  'Daily Motivation': { bg: '#faf5ff', color: '#7e22ce', border: '#e9d5ff' }
                }[post.category] || { bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' };

                return (
                  <div
                    key={post.id || Math.random()}
                    className="glass-panel"
                    style={{
                      padding: '1.35rem',
                      background: '#ffffff',
                      borderRadius: '14px',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.85rem'
                    }}
                  >
                    {/* Author & Header Bar */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg, #0284c7, #3b82f6)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.95rem' }}>
                          {(post.authorName || 'P').charAt(0)}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>{post.authorName || 'Community Member'}</span>
                            {post.authorRole?.includes('Verified') && (
                              <ShieldCheck size={15} color="#0284c7" title="Verified Clinician" />
                            )}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
                            {post.authorRole || 'Community Member'} • {post.timestamp || 'Recently'}
                          </div>
                        </div>
                      </div>

                      {/* Category Badge */}
                      <span style={{ background: catBadgeStyles.bg, color: catBadgeStyles.color, border: `1px solid ${catBadgeStyles.border}`, padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.74rem', fontWeight: 800 }}>
                        {post.category || 'Discussion'}
                      </span>
                    </div>

                    {/* Post Content */}
                    <div>
                      <h3 style={{ fontSize: '1.08rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.35rem 0', letterSpacing: '-0.01em', lineHeight: 1.35 }}>
                        {post.title}
                      </h3>
                      <p style={{ fontSize: '0.86rem', color: '#334155', margin: 0, lineHeight: 1.5, whiteSpace: 'pre-line' }}>
                        {post.content}
                      </p>
                    </div>

                    {/* Footer Interactions (Like & Comment buttons) */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.65rem', marginTop: '0.25rem' }}>
                      <button
                        type="button"
                        onClick={() => handleToggleLike(post)}
                        style={{
                          background: isLiked ? '#fef2f2' : 'transparent',
                          border: isLiked ? '1px solid #fecaca' : 'none',
                          color: isLiked ? '#dc2626' : '#64748b',
                          padding: '0.35rem 0.75rem',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem'
                        }}
                      >
                        <Heart size={15} fill={isLiked ? '#dc2626' : 'none'} color={isLiked ? '#dc2626' : '#64748b'} />
                        <span>{post.likesCount || 0} Support</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleCommentsExpand(post.id)}
                        style={{
                          background: isCommentsOpen ? '#e0f2fe' : 'transparent',
                          border: 'none',
                          color: isCommentsOpen ? '#0284c7' : '#64748b',
                          padding: '0.35rem 0.75rem',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem'
                        }}
                      >
                        <MessageSquare size={15} />
                        <span>{commentsCount} Replies</span>
                      </button>
                    </div>

                    {/* EXPANDABLE COMMENT THREAD */}
                    {isCommentsOpen && (
                      <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '0.85rem', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.2rem' }}>
                        
                        {/* List of comments */}
                        {commentsCount > 0 && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                            {(post.comments || []).map((comment) => (
                              <div key={comment?.id || Math.random()} style={{ background: '#ffffff', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f172a' }}>{comment?.authorName || 'Patient'}</span>
                                    {comment?.authorRole?.includes('Clinician') || comment?.authorRole?.includes('Endocrinologist') ? (
                                      <span style={{ background: '#e0f2fe', color: '#0284c7', fontSize: '0.65rem', padding: '0.05rem 0.35rem', borderRadius: '4px', fontWeight: 800 }}>Verified Doctor</span>
                                    ) : (
                                      <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>• {comment?.authorRole || 'Patient'}</span>
                                    )}
                                  </div>
                                  <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>{comment?.timestamp || 'Recently'}</span>
                                </div>
                                <p style={{ fontSize: '0.82rem', color: '#334155', margin: 0 }}>{comment?.text}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Add Comment Input Form */}
                        <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'center' }}>
                          <input
                            type="text"
                            placeholder="Write a clinical reply or words of encouragement..."
                            value={newCommentInputs[post.id] || ''}
                            onChange={e => setNewCommentInputs({ ...newCommentInputs, [post.id]: e.target.value })}
                            onKeyDown={e => { if (e.key === 'Enter') handleAddComment(post); }}
                            style={{ flex: 1, padding: '0.45rem 0.75rem', fontSize: '0.82rem', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none' }}
                          />
                          <button
                            type="button"
                            onClick={() => handleAddComment(post)}
                            className="btn-primary"
                            style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem', background: '#0284c7', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                          >
                            <Send size={13} />
                            <span>Reply</span>
                          </button>
                        </div>

                      </div>
                    )}

                  </div>
                );
              })
            )}
          </div>

        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 2: VERIFIED CLINICAL GUIDES & RECIPES */}
      {/* ==================================================================== */}
      {activeMainTab === 'knowledge' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Action Bar: Search & Category Filters */}
          <div className="glass-panel" style={{ padding: '1.2rem', background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            {/* Search Bar */}
            <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.45rem 0.75rem' }}>
              <Search size={16} color="#64748b" style={{ marginRight: '0.45rem' }} />
              <input
                type="text"
                placeholder="Search medical guides, recipes, and clinical advice..."
                value={searchKnowledgeQuery}
                onChange={e => setSearchKnowledgeQuery(e.target.value)}
                style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', fontSize: '0.86rem', color: '#0f172a' }}
              />
            </div>

            {/* Category Filter Pills */}
            <div style={{ display: 'flex', gap: '0.45rem', overflowX: 'auto', paddingBottom: '0.15rem' }}>
              {['All', 'Nutrition & GI', 'Clinical Guidance', 'Exercise & Safety', 'Diabetic Recipes'].map((cat) => {
                const isActive = knowledgeFilter === cat;
                const catCount = cat === 'All' ? CLINICAL_GUIDES.length : CLINICAL_GUIDES.filter(g => g.category === cat).length;

                return (
                  <button
                    key={cat}
                    onClick={() => setKnowledgeFilter(cat)}
                    style={{
                      padding: '0.35rem 0.8rem',
                      borderRadius: '6px',
                      border: isActive ? '1px solid #0284c7' : '1px solid #cbd5e1',
                      background: isActive ? '#0284c7' : '#ffffff',
                      color: isActive ? '#ffffff' : '#475569',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}
                  >
                    <span>{cat}</span>
                    <span style={{ background: isActive ? 'rgba(255,255,255,0.25)' : '#f1f5f9', padding: '0.05rem 0.35rem', borderRadius: '4px', fontSize: '0.68rem' }}>
                      {catCount}
                    </span>
                  </button>
                );
              })}
            </div>

          </div>

          {/* Clinical Guides Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {filteredGuides.map((guide) => {
              const IconComponent = guide.icon;

              return (
                <div
                  key={guide.id}
                  className="glass-panel"
                  style={{
                    padding: '1.35rem',
                    background: '#ffffff',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                    justify: 'space-between',
                    gap: '1rem',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.03)'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ background: '#f0f9ff', color: guide.color, border: `1px solid ${guide.color}33`, padding: '0.2rem 0.55rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 800 }}>
                        {guide.category}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>{guide.readTime}</span>
                    </div>

                    <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'flex-start' }}>
                      <div style={{ padding: '0.55rem', borderRadius: '10px', background: `${guide.color}15`, color: guide.color }}>
                        <IconComponent size={20} />
                      </div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0, lineHeight: 1.35 }}>
                        {guide.title}
                      </h3>
                    </div>

                    <p style={{ fontSize: '0.83rem', color: '#475569', margin: 0, lineHeight: 1.45 }}>
                      {guide.summary}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedGuideModal(guide)}
                    className="btn-outline"
                    style={{
                      padding: '0.55rem',
                      fontSize: '0.82rem',
                      fontWeight: 800,
                      borderRadius: '8px',
                      borderColor: guide.color,
                      color: guide.color,
                      justify: 'center',
                      marginTop: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}
                  >
                    <BookOpen size={14} />
                    <span>Read Full Clinical Guide</span>
                  </button>

                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 1: CREATE NEW DISCUSSION POST */}
      {/* ==================================================================== */}
      {isPostModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15, 23, 42, 0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(3px)' }}>
          <div className="glass-panel" style={{ maxWidth: '520px', width: '100%', padding: '1.6rem', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <Sparkles size={18} color="#0284c7" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Create New Community Post
                </h3>
              </div>
              <button onClick={() => setIsPostModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreatePostSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              <div>
                <label style={{ fontSize: '0.76rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '0.25rem', textTransform: 'uppercase' }}>
                  Post Category
                </label>
                <select
                  value={newPostCategory}
                  onChange={e => setNewPostCategory(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}
                >
                  <option value="Success Story">🌟 Success Story (Share your wins)</option>
                  <option value="Diet Tips">🥦 Diet Tips & Recipes</option>
                  <option value="Ask Question">❓ Ask Question (Peer & Doctor advice)</option>
                  <option value="Daily Motivation">💪 Daily Motivation & Support</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.76rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '0.25rem', textTransform: 'uppercase' }}>
                  Discussion Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Swapped white rice with Suwandel, saw instant post-meal improvements!"
                  value={newPostTitle}
                  onChange={e => setNewPostTitle(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.76rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '0.25rem', textTransform: 'uppercase' }}>
                  Discussion Details
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Share details of your experience, question, or dietary tips for fellow patients..."
                  value={newPostContent}
                  onChange={e => setNewPostContent(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setIsPostModalOpen(false)} className="btn-outline" style={{ flex: 1, justifyContent: 'center' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center', background: '#0284c7' }}>
                  Publish Discussion
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 2: FULL CLINICAL ARTICLE READER */}
      {/* ==================================================================== */}
      {selectedGuideModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15, 23, 42, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(4px)' }}>
          <div className="glass-panel" style={{ maxWidth: '640px', width: '100%', maxHeight: '88vh', overflowY: 'auto', padding: '1.75rem', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.85rem' }}>
              <div>
                <span style={{ background: '#f0f9ff', color: selectedGuideModal.color, border: `1px solid ${selectedGuideModal.color}33`, padding: '0.2rem 0.55rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 800 }}>
                  {selectedGuideModal.category}
                </span>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', margin: '0.35rem 0 0 0', letterSpacing: '-0.02em' }}>
                  {selectedGuideModal.title}
                </h2>
              </div>

              <button onClick={() => setSelectedGuideModal(null)} style={{ background: '#f1f5f9', border: 'none', cursor: 'pointer', borderRadius: '50%', padding: '0.4rem', color: '#64748b' }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
              {selectedGuideModal.fullContent}
            </div>

            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setSelectedGuideModal(null)} className="btn-primary" style={{ background: '#0284c7', padding: '0.55rem 1.2rem', fontSize: '0.85rem' }}>
                Close Article
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
