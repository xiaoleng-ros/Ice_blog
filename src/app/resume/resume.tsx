'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaGithub, FaPhone, FaEnvelope, FaGlobe, FaBriefcase, FaGraduationCap, FaCode, FaUser, FaProjectDiagram } from 'react-icons/fa';
import { Resume } from '@/types/app/resume';

export default ({ data }: { data: Resume }) => {
  const { personalInfo, advantages, links, skills, workExperience, projects, education } = data || {};

  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
  }, []);

  // 动画 variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  // 技能标签云数据处理
  const getSkillTags = () => {
    if (!skills || skills.length === 0) return [];
    return skills.map((skill) => {
      // 提取技能名称和熟练度（如果有）
      const parts = skill.split('(');
      const name = parts[0].trim();
      let level = 50; // 默认熟练度
      if (parts.length > 1) {
        const levelMatch = parts[1].match(/(\d+)%/);
        if (levelMatch && levelMatch[1]) {
          level = parseInt(levelMatch[1]);
        }
      }
      return { name, level };
    });
  };

  const skillTags = getSkillTags();

  return (
    <>
      <title>{`${personalInfo?.name ?? ''} - ${personalInfo?.title ?? ''}`}</title>
      <meta name="description" content={`${personalInfo?.name ?? ''} - ${personalInfo?.title ?? ''} 的个人简历`} />

      <div className="min-h-screen py-8 mt-[60px] px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <motion.div initial="hidden" animate="visible" variants={containerVariants} className="max-w-5xl mx-auto">
          {/* 个人信息头部 */}
          <motion.div variants={itemVariants} className="mt-4 mb-8 bg-white dark:bg-gray-800 rounded-2xl border dark:border-black-a overflow-hidden">
            <div className="mt-8 px-8 pb-8 relative">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ duration: 0.5 }} className="relative flex justify-center items-center w-32 h-32 rounded-full overflow-hidden bg-white shadow-xl border-transparent border-4 dark:border-gray-700">
                  <div className="flex justify-center items-center w-[98%] h-[98%] rounded-full overflow-hidden">
                    <img src={personalInfo?.avatar} alt={personalInfo?.name} className="object-cover w-full h-full" />
                  </div>
                </motion.div>

                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{personalInfo?.name}</h1>
                  <h2 className="font-semibold text-blue-600 dark:text-blue-400 mb-3">{personalInfo?.title}</h2>

                  <div className="flex flex-wrap justify-center md:justify-start gap-4 text-gray-600 dark:text-gray-300 mb-4">
                    <span className="flex items-center text-sm">
                      <span className="font-medium mr-1">年龄:</span>
                      {personalInfo?.age}
                    </span>
                    <span className="flex items-center text-sm">
                      <span className="font-medium mr-1">地点:</span>
                      {personalInfo?.location}
                    </span>
                  </div>

                  <div className="flex flex-wrap justify-center md:justify-start gap-4 text-gray-700 dark:text-gray-300">
                    <a href={`tel:${personalInfo?.contact?.phone}`} className="flex items-center hover:text-blue-600 text-sm">
                      <FaPhone className="mr-1 text-blue-500" size={16} />
                      <span>{personalInfo?.contact?.phone}</span>
                    </a>

                    <a href={`mailto:${personalInfo?.contact?.email}`} className="flex items-center hover:text-blue-600 text-sm">
                      <FaEnvelope className="mr-1 text-blue-500" size={16} />
                      <span>{personalInfo?.contact?.email}</span>
                    </a>

                    <a href={personalInfo?.contact?.github} target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-blue-600 text-sm">
                      <FaGithub className="mr-1 text-blue-500" size={16} />
                      <span>GitHub</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 左侧栏 */}
            <div className="lg:col-span-1 space-y-6">
              {/* 个人优势 */}
              <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 border dark:border-black-a rounded-xl p-6">
                <div className="flex items-center mb-4 text-gray-900 dark:text-white">
                  <FaUser className="mr-3 text-blue-500" />
                  <h3 className="text-lg font-bold">个人优势</h3>
                </div>

                <div className="space-y-3 text-gray-600 dark:text-gray-300 text-sm">
                  {advantages?.map((advantage, index) => (
                    <p key={index} className="flex items-center hover:text-blue-600 cursor-pointer">
                      {advantage}
                    </p>
                  ))}
                </div>
              </motion.div>

              {/* 专业技能 */}
              <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 border dark:border-black-a rounded-xl p-6">
                <div className="flex items-center mb-4 text-gray-900 dark:text-white">
                  <FaCode className="mr-3 text-blue-600 text-lg" />
                  <h3 className="text-lg font-bold">专业技能</h3>
                </div>

                <div className="flex flex-wrap gap-2 mb-4 text-gray-600">
                  {skillTags.map((tag, index) => (
                    <p key={index} className="dark:bg-blue-900/30 py-1 rounded-full text-sm font-medium hover:text-blue-600 cursor-pointer">
                      {tag.name}
                    </p>
                  ))}
                </div>
              </motion.div>

              {/* 教育背景 */}
              <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 border dark:border-black-a rounded-xl p-6">
                <div className="flex items-center mb-4 text-gray-900 dark:text-white">
                  <FaGraduationCap className="mr-3 text-blue-500 text-2xl" />
                  <h3 className="text-lg font-bold">教育背景</h3>
                </div>

                <div className="">
                  <div className="flex justify-between mb-3 pb-1.5 border-b border-gray-100 dark:border-gray-700">
                    <h4 className="text-md font-bold text-gray-800 dark:text-white mb-1">{education?.school}</h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-1">
                      {education?.major} | {education?.degree}
                    </p>
                    {/* <p className="text-gray-500 dark:text-gray-400 text-xs">
                      {education?.period}
                    </p> */}
                  </div>

                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1 text-sm">
                    {education?.achievements?.map((achievement, index) => (
                      <li key={index} className="flex items-center">
                        <span className="flex items-center justify-center bg-blue-500 min-w-1.5 min-h-1.5 mr-2 rounded-full"></span>
                        <span>{achievement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>

              {/* 相关链接 */}
              <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 border dark:border-black-a rounded-xl p-6">
                <div className="flex items-center mb-4 text-gray-900 dark:text-white">
                  <FaGlobe className="mr-3 text-blue-500" />
                  <h3 className="text-lg font-bold">相关链接</h3>
                </div>

                <div className="space-y-3">
                  {links?.github && (
                    <a href={links.github} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium transition-colors">
                      <FaGithub className="mr-2" size={16} /> GitHub
                    </a>
                  )}

                  {links?.csdn && (
                    <a href={links.csdn} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium transition-colors">
                      <FaGlobe className="mr-2" size={16} /> CSDN 技术博客
                    </a>
                  )}

                  {links?.blog && (
                    <a href={links.blog} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium transition-colors">
                      <FaProjectDiagram className="mr-2" size={16} /> 开源项目作品
                    </a>
                  )}
                </div>
              </motion.div>
            </div>

            {/* 右侧栏 */}
            <div className="lg:col-span-2 space-y-6">
              {/* 工作经历 */}
              <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 border dark:border-black-a rounded-xl p-6">
                <div className="flex items-center mb-5 text-gray-900 dark:text-white">
                  <FaBriefcase className="mr-3 text-blue-500" />
                  <h3 className="text-lg font-bold">工作经历</h3>
                </div>

                <div className="space-y-6">
                  {workExperience?.map((job, index) => (
                    <div key={index} className="relative pl-6 pb-6 border-l-2 border-blue-200 dark:border-blue-900">
                      <div className="absolute left-[-7px] top-0 w-3 h-3 rounded-full bg-blue-500 ring-4 ring-blue-100 dark:ring-blue-900"></div>
                      <div className="flex flex-wrap justify-between items-start mb-1">
                        <h4 className="text-md font-bold text-gray-900 dark:text-white">{job.company}</h4>
                        <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded mt-1 md:mt-0">{job.period}</span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 font-medium text-sm mb-2">{job.position}</p>
                      <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1 text-sm">
                        {job.responsibilities?.map((responsibility, index) => (
                          <li key={index} className="flex items-center">
                            <span className="flex items-center justify-center bg-blue-500 min-w-1.5 min-h-1.5 mr-2 rounded-full"></span>
                            <span>{responsibility}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* 项目经历 */}
              <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 border dark:border-black-a rounded-xl p-6">
                <div className="flex items-center mb-5 text-gray-900 dark:text-white">
                  <FaProjectDiagram className="mr-3 text-blue-500" />
                  <h3 className="text-lg font-bold">项目经历</h3>
                </div>

                <div className="space-y-6">
                  {projects?.map((project, index) => (
                    <div key={index} className="border border-gray-100 dark:border-gray-700 rounded-lg overflow-hidden">
                      <div className="bg-gray-50 dark:bg-gray-700/50 p-4 border-b border-gray-100 dark:border-gray-700">
                        <div className="flex flex-wrap justify-between items-start mb-1">
                          <h4 className="text-md font-bold text-gray-900 dark:text-white">{project.name}</h4>
                          <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded mt-1 md:mt-0">{project.period}</span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 font-medium text-sm">{project.role}</p>
                      </div>

                      <div className="p-4 space-y-3 text-sm">
                        {!!project.description?.length && (
                          <div>
                            <h5 className="font-bold text-gray-800 dark:text-white mb-1 flex items-center text-sm">项目介绍</h5>
                            <div className="text-gray-600 dark:text-gray-300 text-sm">
                              {project.description?.map((item: string, i: number) => (
                                <p key={i} className="mb-1.5">
                                  {item}
                                </p>
                              ))}
                            </div>
                          </div>
                        )}

                        {project.techStack && (
                          <div>
                            <h5 className="font-bold text-gray-800 dark:text-white mb-1 text-sm">技术栈</h5>
                            <div className="text-gray-600 dark:text-gray-300 text-sm flex flex-wrap gap-2">
                              {typeof project.techStack === 'string' ? (
                                project.techStack
                              ) : (
                                <>
                                  <span className="px-2 py-0.5 rounded text-xs">前端: {project.techStack.frontend}</span>
                                  <span className="px-2 py-0.5 rounded text-xs">后端: {project.techStack.backend}</span>
                                  <span className="px-2 py-0.5 rounded text-xs">部署: {project.techStack.deployment}</span>
                                </>
                              )}
                            </div>
                          </div>
                        )}

                        {!!project.highlights?.length && (
                          <div>
                            <h5 className="font-bold text-gray-800 dark:text-white mb-1 text-sm">项目亮点</h5>
                            <ul className="space-y-1 text-gray-600 dark:text-gray-300 text-sm">
                              {project.highlights.map((highlight, i) => (
                                <li key={i} className="flex items-center">
                                  <span className="flex items-center justify-center bg-blue-500 min-w-1.5 min-h-1.5 mr-2 rounded-full"></span>
                                  <span>{highlight}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {!!project.challenges?.length && (
                          <div>
                            <h5 className="font-bold text-gray-800 dark:text-white mb-1 text-sm">项目难点</h5>
                            <ul className="space-y-1 text-gray-600 dark:text-gray-300 text-sm">
                              {project.challenges.map((item, i) => (
                                <li key={i} className="flex items-center">
                                  <span className="flex items-center justify-center bg-blue-500 min-w-1.5 min-h-1.5 mr-2 rounded-full"></span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {!!project.repositories?.length && (
                          <div>
                            <h5 className="font-bold text-gray-800 dark:text-white mb-1 text-sm">相关链接</h5>
                            <div className="flex flex-wrap gap-2">
                              {project.repositories?.map((item, index) => (
                                <div key={index} className="flex items-center">
                                  <span>{item.name}：</span>
                                  <a href={item.url as string} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-xs font-medium bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded transition-colors">
                                    {item.url}
                                  </a>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {!!project.achievements?.length && (
                          <div>
                            <h5 className="font-bold text-gray-800 dark:text-white mb-1 text-sm">业绩</h5>
                            <ul className="space-y-1 text-gray-600 dark:text-gray-300 text-sm">
                              {Array.isArray(project.achievements) ? (
                                project.achievements.map((achievement, i) => (
                                  <li key={i} className="flex items-center">
                                    <span className="flex items-center justify-center bg-blue-500 min-w-1.5 min-h-1.5 mr-2 rounded-full"></span>
                                    <span>{achievement}</span>
                                  </li>
                                ))
                              ) : (
                                <li className="flex items-center">
                                  <span className="flex items-center justify-center bg-blue-500 min-w-1.5 min-h-1.5 mr-2 rounded-full"></span>
                                  <span>{project.achievements}</span>
                                </li>
                              )}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};
