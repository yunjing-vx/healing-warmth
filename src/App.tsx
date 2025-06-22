import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Send, Heart, Shield, Zap, Brain, Cpu, Moon, Battery, BookOpen, Activity, Droplets } from 'lucide-react'

interface Message {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
  bodySystem?: string
}

const medicalResponses = {
  immune: [
    "🌡️ 你的体温升高啦！这其实是你体内的「超级英雄军团」在行动哦～你的免疫细胞们正在召开紧急会议：「报告队长！有外敌入侵！」「收到！立即升温作战！」发热是身体的自然防御机制，就像给细菌病毒们制造一个「桑拿房」，让它们感到不舒服而无法繁殖呢！💪",
    "🔥 哈哈，你的身体现在就像一个忙碌的「细胞工厂」！白细胞大军正在加班加点地生产「抗体导弹」，发热就是它们努力工作时产生的「热量副产品」。想象一下，你的T细胞正在大喊：「兄弟们，开火！把这些坏蛋都赶走！」虽然现在有点难受，但这说明你的免疫系统超级给力呢！🚀",
    "🌡️ 你的下丘脑现在化身成了「体温调节总指挥」！它接到免疫系统的报告后，立刻下令：「全体注意！现在进入战斗模式，体温上调3度！」你的血管开始收缩，肌肉开始颤抖生热，这就是身体在为对抗入侵者而全力以赴呢！🎯"
  ],
  respiratory: [
    "😤 咳咳咳～你听，这是你的呼吸道在进行「大扫除」呢！你的纤毛细胞们就像勤劳的清洁工，正在用「咳嗽扫把」把入侵的灰尘、细菌统统扫地出门。每一声咳嗽都是在说：「不好意思，这里不欢迎你们！请立刻离开！」虽然有点吵，但这是你身体最有效的「自我保护程序」哦！🧹✨",
    "🌪️ 你的支气管现在变身成了「超级吸尘器」！咳嗽是你的肺部在执行「强制清理模式」，把所有不该在那里的东西都咳出来。你的巨噬细胞正在大喊：「快看！我发现可疑物质！启动咳嗽程序！」这就像你的身体在进行春季大扫除，虽然过程有点辛苦，但清理完就舒服啦！💨",
    "🫁 你的肺泡小卫士们现在超级忙碌！它们发现有异物入侵，立刻启动了「咳嗽反射弧」。你的迷走神经像个敏感的警报器，一发现问题就大喊：「咳嗽部队出动！」虽然听起来很辛苦，但这是你的呼吸系统在认真保护你哦！🛡️"
  ],
  nervous: [
    "🧠 哎呀，你的大脑现在可能有点「交通堵塞」呢！头痛往往是因为血管扩张或收缩导致的。想象一下，你的神经小人们正在大喊：「这里压力太大了！需要放松一下！」可能是因为压力、缺水或者睡眠不足，你的大脑在温柔地提醒你：「主人，我需要休息和关爱！」💆‍♀️",
    "⚡ 你的头部现在就像一个「超负荷运转的电脑」！神经元们可能在说：「老板，我们需要更多的氧气和葡萄糖！」头痛是大脑的求救信号，它在告诉你：「嘿，慢下来，给我一些温柔的照顾吧！」喝点水，深呼吸，让你的大脑小人们重新找到平衡～🌟",
    "🧠 你的三叉神经现在可能有点敏感呢！它就像大脑的「疼痛传感器」，当血管周围的神经受到刺激时，就会发送「痛痛信号」。你的大脑在说：「注意！这里需要关注！」也许是时候放下手头的事情，给自己一个温暖的拥抱了～🤗",
    "💙 感受到焦虑了吗？这是你的杏仁核（大脑的小警卫）在努力保护你呢！它有点像个过于尽职的保安，即使没有真正的危险，也会拉响警报。你的肾上腺在分泌肾上腺素说：「主人可能需要帮助！」深呼吸，告诉你的小警卫：「谢谢你的关心，现在很安全～」🤗",
    "🌈 你的大脑现在可能像个「过度保护的妈妈」，总是担心各种可能发生的事情。你的前额皮质和边缘系统在进行激烈讨论：「这个情况安全吗？」「我们需要准备应对吗？」焦虑其实是大脑想要保护你的表现，给自己一些耐心和理解吧～💕",
    "✨ 你知道吗？焦虑时你的身体会释放很多「准备行动」的化学物质，就像战士准备上战场一样。但现在这个「战场」可能只存在于想象中。你的神经系统在说：「我随时准备保护你！」感谢它的好意，然后温柔地告诉它：「现在可以放松了～」🌸"
  ],
  digestive: [
    "🏠 你的肠胃现在可能在进行「内部装修」呢！胃酸分泌增加，肠道蠕动改变，就像你的消化系统在重新调整工作流程。你的胃壁细胞可能在说：「今天的工作量有点大，我们需要加强防护！」这时候温柔对待你的小肚子，给它一些温暖和简单易消化的食物吧！🤗",
    "🌊 你的肠道现在像是在进行「海浪运动」！肠道平滑肌正在努力调节蠕动节奏，可能是压力、饮食或情绪影响了这个精密的「消化工厂」。你的肠道菌群小伙伴们在努力维持平衡，它们在说：「别担心，我们正在努力恢复正常运转！」给肚子一些温暖的拥抱吧～💙",
    "🦠 你的肠道里住着100万亿个「微生物邻居」呢！它们平时相处得很和谐，但有时候会因为新食物的到来而开个「社区会议」。你的胃部不适可能就是它们在讨论：「这个新来的食物怎么分工处理？」放心，你的肠道菌群很快就会达成一致意见的！🏘️"
  ],
  circulatory: [
    "❤️ 你的心脏是个不知疲倦的「超级泵站」！它每分钟跳动60-100次，每次都把富含氧气的血液送到全身。当你感到疲惫时，可能是你的循环系统在说：「我们需要更多的氧气和营养补给！」你的红血球快递员们正在加班运送生命必需品呢！🚛",
    "🌊 你的血管网络就像城市的「超级高速公路」！动脉、静脉、毛细血管组成了总长10万公里的运输网络。疲劳时，你的血流可能在调整配送策略：「重要器官优先供应！」这是你身体智能分配资源的表现～💫",
    "🔋 感到乏力吗？你的循环系统可能在进行「系统维护」！心脏在努力调节泵血频率，血管在调整管径大小，血压在寻找最佳平衡点。就像汽车需要保养一样，给你的「生命引擎」一些休息时间吧！⚡",
    "💨 你的肺部和心脏是最佳拍档！肺部负责氧气交换，心脏负责运输配送。当你深呼吸时，就是在给这个完美的循环系统充电。你的血红蛋白小背包们正在开心地装载新鲜氧气，准备出发送货啦！🎒"
  ],
  endocrine: [
    "😴 睡眠问题呀～你的褪黑素小精灵可能在罢工呢！它们通常在天黑后开始工作，但有时会被蓝光、压力或兴奋打扰。你的松果体在困惑地说：「现在到底是白天还是晚上？」帮助它们找回节奏，创造一个舒适的睡眠环境吧！🌙",
    "🌟 你的大脑现在可能像个「停不下来的洗衣机」，思绪在不停地转动。你的神经元们在说：「还有好多事情要想！」但其实，睡眠时大脑会进行「深度清洁模式」，清理一天积累的「垃圾蛋白」。给大脑一个信号：「现在是休息时间啦～」💤",
    "🧠 你的睡眠中枢和觉醒中枢正在进行「班次交接」呢！有时候它们会有点混乱，就像两个值班员搞不清楚谁该下班。你的腺苷（睡眠压力物质）在慢慢积累说：「该睡觉了！」听听身体的节拍，跟着自然的睡眠节律走吧～🎵",
    "⚖️ 你的内分泌系统就像身体的「调节大师」！下丘脑、垂体、甲状腺这些小伙伴们正在开会讨论：「今天的激素分泌够均衡吗？」当你感到疲惫或情绪波动时，可能是这些荷尔蒙调节员们在重新校准工作状态。给它们一些时间，让身体找回最佳平衡～🎭"
  ],
  general: [
    "🌟 你知道吗？现在你的身体就像一座繁忙的「细胞城市」，每个细胞都在为你的健康而努力工作！虽然现在可能感觉不太舒服，但这正说明你的免疫系统非常活跃，正在积极对抗外界的威胁。相信你的身体，它比你想象的更强大！💪",
    "🏥 你的身体现在就是一个「超级修复工厂」！干细胞工程师们正在加班加点地修复受损组织，血小板小护士们在包扎伤口，白细胞战士们在清理战场。每一个不舒服的感觉都是你的身体在积极自愈的证明。你不是一个人在战斗，有千亿个细胞在为你加油！🎉",
    "💝 你的身体真的是个奇迹！每秒钟都有数百万个生化反应在进行，每个器官都在默默为你工作。即使在你休息的时候，你的心脏还在跳动，肺部还在呼吸，大脑还在处理信息。感谢这个陪伴你一生的「超级机器」，给它一些爱和关怀吧！✨",
    "🌱 记住，生病也是成长的一部分呢！就像植物需要经历风雨才能更加茁壮，你的免疫系统也在这个过程中变得更加强大。你的T细胞会记住这次的「战斗经验」，下次遇到相似情况时反应会更快。你正在变得更健康、更强壮！🌳"
  ],
  knowledge: [
    "🧠 你知道吗？你的大脑每天会产生大约7万个想法！这些想法就像小蝴蝶一样在你的神经元之间飞舞。你的前额皮质就像个「想法管理员」，帮你筛选哪些想法值得关注～每一个想法都是你大脑创造力的体现呢！✨",
    "❤️ 你的心脏真是个超级马拉松选手！它每天跳动大约10万次，一生中会跳动超过25亿次！你的心肌细胞们从不休息，它们在说：「为了主人，我们要一直跳动下去！」每一次心跳都是生命的节奏，多么美妙！🎵",
    "🫁 你的肺部是个神奇的「气体交换站」！如果把你的肺泡全部展开，面积相当于一个网球场！你的红血球小快递员们在肺泡里忙碌地装载氧气，卸下二氧化碳，它们在说：「新鲜氧气，马上送达！」🚚",
    "🦠 你的肠道里有个「微生物王国」！大约100万亿个细菌朋友和你和谐共处。它们不仅帮你消化食物，还帮你制造维生素，调节情绪。你的肠道菌群在开心地说：「我们是你最好的室友！」这个微观世界多么奇妙！🏰",
    "🩸 你的血液是个「24小时快递公司」！红血球们每4个月就会更新一次，它们携带氧气环游全身只需要20秒！你的血小板小护士们随时准备修补伤口，白血球战士们时刻守护你的健康。这个流动的生命河流多么壮观！🌊",
    "🧬 你的DNA藏着宇宙级的秘密！如果把你一个细胞里的DNA展开，长度约2米，而你全身所有DNA连起来可以绕地球670万圈！你的基因就像一本37亿年进化史的传奇小说，每一页都写着生命的奇迹！📚",
    "🌟 你的身体每7年会完全更新一次！除了神经细胞，你现在的身体细胞和7年前完全不同。你就像一条永远在重建的河流，每一天都在成为新的自己。你的身体在温柔地说：「我们一起成长，一起变得更好！」💫",
    "👁️ 你的眼睛是「超级高清摄像头」！能分辨1000万种颜色，处理速度比任何电脑都快。你的视网膜上有1.2亿个感光细胞在不停工作，它们把光转化成电信号发送给大脑。每一次眨眼都是在给这台精密设备「清洁镜头」！📸"
  ]
}

const getRandomResponse = (symptom: string): string => {
  const responses = medicalResponses[symptom as keyof typeof medicalResponses] || medicalResponses.general
  return responses[Math.floor(Math.random() * responses.length)]
}

const detectSymptom = (message: string): string => {
  const lowerMessage = message.toLowerCase()
  if (lowerMessage.includes('发烧') || lowerMessage.includes('发热') || lowerMessage.includes('体温') || lowerMessage.includes('高烧')) return 'immune'
  if (lowerMessage.includes('咳嗽') || lowerMessage.includes('咳') || lowerMessage.includes('嗓子') || lowerMessage.includes('喉咙') || lowerMessage.includes('呼吸')) return 'respiratory'
  if (lowerMessage.includes('头痛') || lowerMessage.includes('头疼') || lowerMessage.includes('头晕') || lowerMessage.includes('偏头痛')) return 'nervous'
  if (lowerMessage.includes('肚子') || lowerMessage.includes('胃') || lowerMessage.includes('腹痛') || lowerMessage.includes('恶心') || lowerMessage.includes('胃痛')) return 'digestive'
  if (lowerMessage.includes('累') || lowerMessage.includes('疲劳') || lowerMessage.includes('乏力') || lowerMessage.includes('没力气') || lowerMessage.includes('困')) return 'circulatory'
  if (lowerMessage.includes('焦虑') || lowerMessage.includes('紧张') || lowerMessage.includes('担心') || lowerMessage.includes('害怕') || lowerMessage.includes('恐惧')) return 'nervous'
  if (lowerMessage.includes('睡不着') || lowerMessage.includes('失眠') || lowerMessage.includes('睡眠') || lowerMessage.includes('多梦') || lowerMessage.includes('早醒')) return 'endocrine'
  if (lowerMessage.includes('心跳') || lowerMessage.includes('心慌') || lowerMessage.includes('胸闷') || lowerMessage.includes('血压')) return 'circulatory'
  if (lowerMessage.includes('小知识') || lowerMessage.includes('科普') || lowerMessage.includes('有趣') || lowerMessage.includes('身体知识')) return 'knowledge'
  return 'general'
}

const systemNames = {
  immune: '免疫防御系统',
  respiratory: '呼吸循环系统',
  nervous: '神经调控系统',
  digestive: '消化代谢系统',
  circulatory: '循环运输系统',
  endocrine: '内分泌调节系统',
  general: '多系统协作',
  knowledge: '身体科学'
}

const systemDescriptions = {
  immune: '守护者联盟·抵御外敌',
  respiratory: '生命之息·氧气运输',
  nervous: '指挥中心·信息传递',
  digestive: '营养工厂·能量转化',
  circulatory: '运输网络·物质循环',
  endocrine: '调节大师·平衡维护',
  general: '全身协调·和谐统一',
  knowledge: '奥秘探索·科学认知'
}

function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: '你好呀！我是"愈见温暖"🌟✨ 当你感到不舒服的时候，我就在这里陪伴你。每一个症状都会被温柔理解，每一份担心都会被暖心安抚。我会用温暖有趣的方式告诉你身体里正在发生什么，让生病的时光也充满温暖！想和我聊聊吗？',
      isUser: false,
      timestamp: new Date(),
      bodySystem: 'general'
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const handleSendMessage = () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      isUser: true,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    // 模拟AI思考时间
    setTimeout(() => {
      const symptom = detectSymptom(inputValue)
      const response = getRandomResponse(symptom)

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        isUser: false,
        timestamp: new Date(),
        bodySystem: symptom
      }

      setMessages(prev => [...prev, aiMessage])
      setIsTyping(false)
    }, 1000 + Math.random() * 2000)
  }

  const sendKnowledgeMessage = () => {
    const knowledgeResponse = getRandomResponse('knowledge')

    const aiMessage: Message = {
      id: Date.now().toString(),
      content: knowledgeResponse,
      isUser: false,
      timestamp: new Date(),
      bodySystem: 'knowledge'
    }

    setMessages(prev => [...prev, aiMessage])
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-pink-50">
      <div className="container mx-auto max-w-4xl p-4">
        {/* 头部 */}
        <Card className="mb-4 bg-orange-50/90 backdrop-blur shadow-lg border-0">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
              🌟 愈见温暖
            </CardTitle>
            <p className="text-muted-foreground text-sm mb-3">
              你的专属生病陪伴，用温暖话语陪你度过不舒服的时光 🧡
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
              {Object.entries(systemNames).filter(([key]) => key !== 'general' && key !== 'knowledge').map(([key, name]) => (
                <div key={key} className="flex items-center gap-1 text-muted-foreground">
                  {key === 'immune' && <Shield className="w-3 h-3 text-orange-500" />}
                  {key === 'respiratory' && <Zap className="w-3 h-3 text-blue-500" />}
                  {key === 'nervous' && <Brain className="w-3 h-3 text-purple-500" />}
                  {key === 'digestive' && <Heart className="w-3 h-3 text-green-500" />}
                  {key === 'circulatory' && <Activity className="w-3 h-3 text-red-500" />}
                  {key === 'endocrine' && <Droplets className="w-3 h-3 text-indigo-500" />}
                  <span className="truncate">{name}</span>
                </div>
              ))}
            </div>
          </CardHeader>
        </Card>

        {/* 聊天区域 */}
        <Card className="h-[500px] bg-orange-50/95 backdrop-blur shadow-lg border-0">
          <CardContent className="p-0 h-full flex flex-col">
            <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.isUser ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    <Avatar className={`w-8 h-8 ${message.isUser ? 'bg-orange-100' : 'bg-pink-100'}`}>
                      <AvatarFallback className={message.isUser ? 'text-orange-600' : 'text-pink-600'}>
                        {message.isUser ? '你' : '🩺'}
                      </AvatarFallback>
                    </Avatar>

                    <div className={`max-w-[70%] space-y-2 ${message.isUser ? 'items-end' : 'items-start'} flex flex-col`}>
                      {!message.isUser && message.bodySystem && (
                        <Badge variant="secondary" className="text-xs bg-gradient-to-r from-orange-100 to-pink-100 border-0">
                          <div className="flex items-center gap-1">
                            {message.bodySystem === 'immune' && <Shield className="w-3 h-3" />}
                            {message.bodySystem === 'respiratory' && <Zap className="w-3 h-3" />}
                            {message.bodySystem === 'nervous' && <Brain className="w-3 h-3" />}
                            {message.bodySystem === 'digestive' && <Heart className="w-3 h-3" />}
                            {message.bodySystem === 'circulatory' && <Activity className="w-3 h-3" />}
                            {message.bodySystem === 'endocrine' && <Droplets className="w-3 h-3" />}
                            {message.bodySystem === 'general' && <Cpu className="w-3 h-3" />}
                            {message.bodySystem === 'knowledge' && <BookOpen className="w-3 h-3" />}
                            <span className="text-xs">{systemNames[message.bodySystem as keyof typeof systemNames]}</span>
                          </div>
                          {systemDescriptions[message.bodySystem as keyof typeof systemDescriptions] && (
                            <div className="text-[10px] text-orange-600 mt-1">
                              {systemDescriptions[message.bodySystem as keyof typeof systemDescriptions]}
                            </div>
                          )}
                        </Badge>
                      )}

                      <div
                        className={`p-3 rounded-2xl ${
                          message.isUser
                            ? 'bg-gradient-to-r from-orange-400 to-pink-400 text-white'
                            : 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-900'
                        }`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {message.content}
                        </p>
                      </div>

                      <span className="text-xs text-muted-foreground">
                        {message.timestamp.toLocaleTimeString('zh-CN', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex gap-3">
                    <Avatar className="w-8 h-8 bg-pink-100">
                      <AvatarFallback className="text-pink-600">🩺</AvatarFallback>
                    </Avatar>

                    <div className="bg-gradient-to-r from-amber-100 to-orange-100 p-3 rounded-2xl">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.1s]" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* 输入区域 */}
            <div className="p-4 border-t bg-orange-50/70">
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="告诉我你哪里不舒服，或者想了解什么..."
                  className="flex-1 border-orange-200 focus:border-orange-300 focus:ring-orange-200"
                  disabled={isTyping}
                />
                <Button
                  onClick={sendKnowledgeMessage}
                  className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 border-0"
                  disabled={isTyping}
                  title="随机身体小知识"
                >
                  💡
                </Button>
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping}
                  className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 border-0"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 mt-3">
                {[
                  { text: '我发烧了', system: 'immune' },
                  { text: '一直咳嗽', system: 'respiratory' },
                  { text: '头很痛', system: 'nervous' },
                  { text: '肚子不舒服', system: 'digestive' },
                  { text: '感觉很累', system: 'circulatory' },
                  { text: '有点焦虑', system: 'nervous' },
                  { text: '睡不着觉', system: 'endocrine' },
                  { text: '身体小知识', system: 'knowledge' }
                ].map((suggestion) => (
                  <Button
                    key={suggestion.text}
                    variant="outline"
                    size="sm"
                    className="text-xs border-orange-200 hover:bg-orange-50 hover:border-orange-300 flex items-center gap-1"
                    onClick={() => suggestion.text === '身体小知识' ? sendKnowledgeMessage() : setInputValue(suggestion.text)}
                    disabled={isTyping}
                    title={systemDescriptions[suggestion.system as keyof typeof systemDescriptions]}
                  >
                    {suggestion.system === 'immune' && <Shield className="w-3 h-3" />}
                    {suggestion.system === 'respiratory' && <Zap className="w-3 h-3" />}
                    {suggestion.system === 'nervous' && <Brain className="w-3 h-3" />}
                    {suggestion.system === 'digestive' && <Heart className="w-3 h-3" />}
                    {suggestion.system === 'circulatory' && <Activity className="w-3 h-3" />}
                    {suggestion.system === 'endocrine' && <Droplets className="w-3 h-3" />}
                    {suggestion.system === 'knowledge' && <BookOpen className="w-3 h-3" />}
                    {suggestion.text}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 底部提示 */}
        <div className="text-center mt-4 text-xs text-muted-foreground">
          🧡 愈见温暖，陪伴生病时光的每一刻 · 严重症状请及时就医
        </div>
      </div>
    </div>
  )
}

export default App
